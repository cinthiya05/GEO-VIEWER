# scheduled_tips.py
import datetime

# Sample tip list
tips = [
    "Stay in well-lit areas at night.",
    "Keep your emergency contacts updated.",
    "Share your live location with someone you trust.",
    "Always keep your phone charged.",
    "Know the nearest police station and hospital.",
]

def scheduled_tips_data():
    # Return a new tip every 10 minutes based on current time
    now = datetime.datetime.now()
    index = (now.hour * 60 + now.minute) // 10 % len(tips)
    return {"tip": tips[index]}
