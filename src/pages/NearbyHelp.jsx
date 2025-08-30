import React, { useEffect, useState } from 'react';

const NearbyHelp = () => {
  const [location, setLocation] = useState(null);
  const [places, setPlaces] = useState([]);
  const [error, setError] = useState('');

  const GOOGLE_MAPS_API_KEY = 'YOUR_GOOGLE_MAPS_API_KEY'; // 🔒 Replace with your real API key

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setLocation(coords);
        fetchNearbyPlaces(coords);
      },
      () => setError('Unable to retrieve location')
    );
  }, []);

  const fetchNearbyPlaces = async ({ lat, lng }) => {
    const types = ['police', 'hospital'];
    try {
      const responses = await Promise.all(
        types.map((type) =>
          fetch(
            `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=3000&type=${type}&key=${GOOGLE_MAPS_API_KEY}`
          ).then((res) => res.json())
        )
      );

      const combinedResults = responses.flatMap((res) => res.results || []);
      setPlaces(combinedResults);
    } catch (err) {
      setError('Failed to fetch nearby places');
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Nearby Police & Hospitals</h1>
      {error && <p className="text-red-500">{error}</p>}
      {places.length > 0 ? (
        <ul className="space-y-2">
          {places.map((place, idx) => (
            <li key={idx} className="border p-2 rounded shadow">
              <h2 className="font-semibold">{place.name}</h2>
              <p>{place.vicinity}</p>
              <p>Rating: {place.rating || 'N/A'}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p>Fetching nearby help centers...</p>
      )}
    </div>
  );
};

export default NearbyHelp;
