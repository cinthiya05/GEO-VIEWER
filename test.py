from fastapi import FastAPI, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from geopy.geocoders import Nominatim
from geopy.distance import geodesic
from openai import OpenAI
import requests

# Initialize app and services
app = FastAPI()

client = OpenAI(api_key="") 
geolocator = Nominatim(user_agent="safety-ai")

# CORS settings
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Overpass API URL
OVERPASS_URL = "https://overpass-api.de/api/interpreter"

def get_nearby_places(lat, lon, amenity, radius=5000):
    """
    Query OpenStreetMap Overpass API to find nearby places of given amenity type.
    Returns top 2 closest with distances.
    """
    query = f"""
    [out:json];
    node(around:{radius},{lat},{lon})[amenity={amenity}];
    out;
    """
    try:
        res = requests.post(OVERPASS_URL, data=query, timeout=10)
        res.raise_for_status()
        data = res.json()
    except Exception:
        return []

    places = []
    for element in data.get("elements", []):
        name = element.get("tags", {}).get("name")
        if name:
            dist = geodesic((lat, lon), (element["lat"], element["lon"])).km
            places.append((name, dist))
    
    return sorted(places, key=lambda x: x[1])[:2]

@app.get("/ai-suggestion")
def get_ai_suggestion(lat: float = Query(...), lon: float = Query(...)):
    try:
        # Reverse geocode city/state
        try:
            location = geolocator.reverse((lat, lon), language="en", timeout=10)
            address = location.raw.get("address", {})
            city = (
                address.get("city")
                or address.get("town")
                or address.get("village")
                or "Unknown"
            )
            state = address.get("state", "Unknown")
        except Exception:
            city, state = "Unknown", "Unknown"

        # Get nearby hospitals and police stations
        hospitals = get_nearby_places(lat, lon, "hospital")
        police_stations = get_nearby_places(lat, lon, "police")

        # AI-generated safety tips
        prompt = f"Suggest 3 concise safety tips for a woman traveling alone in {city}, {state}."
        chat_response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful assistant specialized in women's travel safety."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.7,
            max_tokens=150,
        )
        tips_text = chat_response.choices[0].message.content.strip()
        safety_tips = [
            tip.strip(" -•") for tip in tips_text.split("\n") if tip.strip()
        ]

        return {
            "location": {
                "latitude": lat,
                "longitude": lon,
                "city": city,
                "state": state,
            },
            "safety_tips": safety_tips,
            "help_places": {
                "hospitals": [f"{name} ({dist:.2f} km)" for name, dist in hospitals] if hospitals else [],
                "police_stations": [f"{name} ({dist:.2f} km)" for name, dist in police_stations] if police_stations else [],
            },
        }

    except Exception as e:
        return JSONResponse(
            content={
                "error": str(e),
                "location": {
                    "latitude": lat,
                    "longitude": lon,
                    "city": "Unknown",
                    "state": "Unknown",
                },
                "safety_tips": [],
                "help_places": {"hospitals": [], "police_stations": []},
            },
            status_code=500,
        )

@app.post("/ai-chat")
async def ai_chat(request: Request):
    try:
        message = (await request.body()).decode("utf-8").strip()
        if not message:
            return JSONResponse(
                content={"error": "Empty message received"}, status_code=400
            )

        # GPT Chat
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a helpful AI giving safety and awareness tips for travelers."},
                {"role": "user", "content": message},
            ],
        )
        reply = response.choices[0].message.content.strip()

        return {
            "status": "success",
            "user_input": message,
            "response": reply,
        }

    except Exception as e:
        return JSONResponse(
            content={"status": "error", "message": str(e)}, status_code=500
        )
