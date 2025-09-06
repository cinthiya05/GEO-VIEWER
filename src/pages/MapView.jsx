import React, { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  IconButton,
  Tooltip,
  Grid,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ContactPhoneIcon from "@mui/icons-material/ContactPhone";
import WarningIcon from "@mui/icons-material/Warning";

const MapView = () => {
  const [location, setLocation] = useState(null);
  const [latestData, setLatestData] = useState(null);
  const mapRef = useRef(null); // Leaflet map instance
  const markerRef = useRef(null); // Marker instance

  // 🔹 Fetch only latest location data from Firebase
  const fetchLocation = async () => {
    try {
      const res = await fetch(
        "https://alert-buddy-tracker-default-rtdb.firebaseio.com/locations.json"
      );
      const data = await res.json();
      console.log("Full Firebase Response:", data);

      if (data) {
        const entries = Object.values(data);
        const latest = entries.reduce((a, b) =>
          new Date(a.timestamp) > new Date(b.timestamp) ? a : b
        );

        setLocation({ lat: latest.lat, lng: latest.lng });
        setLatestData(latest);
        console.log("Latest Entry:", latest);
      }
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  // 🔹 Initialize the map only once
  useEffect(() => {
    const mapContainer = document.getElementById("map");

    if (mapContainer && mapContainer._leaflet_id != null) {
      mapContainer._leaflet_id = null;
    }

    const map = L.map("map").setView([20.5937, 78.9629], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    mapRef.current = map;

    // Add a small delay to ensure UI is rendered before fetching
    const timer = setTimeout(() => {
      fetchLocation();
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // 🔹 Update map when latest data changes
  useEffect(() => {
    if (!mapRef.current || !latestData) return;

    const map = mapRef.current;
    const { lat, lng } = latestData;

    map.setView([lat, lng], 15);

    // Remove previous marker if exists
    if (markerRef.current) {
      map.removeLayer(markerRef.current);
    }

    const marker = L.marker([lat, lng])
      .addTo(map)
      .bindPopup(`Live Location:<br/>Lat: ${lat}<br/>Lng: ${lng}`)
      .openPopup();

    markerRef.current = marker;
  }, [latestData]);

  // 🔹 Card config for displaying user details
  const cardConfig = [
    { key: "name", label: "Name", icon: <PersonIcon />, color: "#E3F2FD" },
    { key: "email", label: "Email", icon: <EmailIcon />, color: "#FFF3E0" },
    { key: "contact", label: "Contact", icon: <PhoneIcon />, color: "#E8F5E9" },
    { key: "emergency1", label: "Emergency Contact 1", icon: <ContactPhoneIcon />, color: "#F3E5F5" },
    { key: "emergency2", label: "Emergency Contact 2", icon: <ContactPhoneIcon />, color: "#FFEBEE" },
    { key: "address", label: "Address", icon: <LocationOnIcon />, color: "#E0F7FA" },
    { key: "sosType", label: "SOS Type", icon: <WarningIcon />, color: "#FFF9C4" },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)",
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 1400,
          width: "100%",
          boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
          borderRadius: 5,
          background: "linear-gradient(135deg, #fc5c7d 0%, #6a82fb 100%)",
          color: "#fff",
          overflow: "visible",
          p: 3,
        }}
      >
        <CardContent>
          <Typography
            variant="h4"
            gutterBottom
            textAlign="center"
            sx={{ fontWeight: "bold", letterSpacing: 1 }}
          >
            Live Location Map
          </Typography>
          <Grid container spacing={4} alignItems="flex-start">
            {/* Cards section */}
            <Grid item xs={12} md={5}>
              {latestData && (
                <Box>
                  <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                      fontWeight: "bold",
                      color: "#fff",
                      textShadow: "0 2px 8px #6a82fb",
                      textAlign: "center",
                    }}
                  >
                    User Details
                  </Typography>
                  <Grid container spacing={2} sx={{ mt: 2 }}>
                    <Grid item xs={6}>
                      <Stack spacing={2}>
                        {cardConfig.slice(0, 4).map(({ key, label, icon, color }) =>
                          latestData[key] ? (
                            <Card
                              key={key}
                              sx={{
                                background: `linear-gradient(135deg, ${color} 60%, #fff 100%)`,
                                borderRadius: 3,
                                boxShadow: "0 4px 16px 0 rgba(0,0,0,0.12)",
                                minWidth: 140,
                                maxWidth: 180,
                                mx: "auto",
                                color: "#222",
                                p: 1.5,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-start",
                                transition: "transform 0.2s",
                                "&:hover": {
                                  transform: "scale(1.04)",
                                  boxShadow: "0 8px 24px 0 rgba(0,0,0,0.18)",
                                },
                              }}
                            >
                              <CardContent sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Box sx={{ fontSize: 24 }}>{icon}</Box>
                                <Box>
                                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: "bold", fontSize: 13 }}>
                                    {label}
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: "bold", fontSize: 14 }}>
                                    {latestData[key]}
                                  </Typography>
                                </Box>
                              </CardContent>
                            </Card>
                          ) : null
                        )}
                      </Stack>
                    </Grid>
                    <Grid item xs={6}>
                      <Stack spacing={2}>
                        {cardConfig.slice(4, 7).map(({ key, label, icon, color }) =>
                          latestData[key] ? (
                            <Card
                              key={key}
                              sx={{
                                background: `linear-gradient(135deg, ${color} 60%, #fff 100%)`,
                                borderRadius: 3,
                                boxShadow: "0 4px 16px 0 rgba(0,0,0,0.12)",
                                minWidth: 140,
                                maxWidth: 180,
                                mx: "auto",
                                color: "#222",
                                p: 1.5,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "flex-start",
                                transition: "transform 0.2s",
                                "&:hover": {
                                  transform: "scale(1.04)",
                                  boxShadow: "0 8px 24px 0 rgba(0,0,0,0.18)",
                                },
                              }}
                            >
                              <CardContent sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Box sx={{ fontSize: 24 }}>{icon}</Box>
                                <Box>
                                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: "bold", fontSize: 13 }}>
                                    {label}
                                  </Typography>
                                  <Typography variant="body2" sx={{ fontWeight: "bold", fontSize: 14 }}>
                                    {latestData[key]}
                                  </Typography>
                                </Box>
                              </CardContent>
                            </Card>
                          ) : null
                        )}
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </Grid>

            {/* Map section */}
            <Grid item xs={12} md={7} sx={{ display: "flex", flexDirection: "column", minHeight: { md: "700px" } }}>
              {location && (
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <Typography variant="body1" sx={{ fontWeight: "bold", fontSize: 18 }}>
                    Latitude: {location.lat}, Longitude: {location.lng}
                  </Typography>
                  <Tooltip title="View in Google Maps">
                    <IconButton
                      color="primary"
                      component="a"
                      href={`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        background: "linear-gradient(90deg, #56ab2f 0%, #a8e063 100%)",
                        color: "#fff",
                        boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)",
                        borderRadius: 2,
                        "&:hover": { opacity: 0.9 },
                      }}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                </Stack>
              )}
              <Box
                id="map"
                sx={{
                  flex: 1,
                  width: "100%",
                  aspectRatio: { xs: "auto", md: "2 / 1" },
                  minHeight: { md: "400px" },
                  maxHeight: { md: "700px" },
                  border: "2px solid #fff",
                  borderRadius: 4,
                  boxShadow: "0 4px 24px 0 rgba(0,0,0,0.12)",
                  background: "#fff",
                }}
              />
              <Box display="flex" justifyContent="center" mt={3}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={fetchLocation}
                  sx={{
                    background: "#1976d2",
                    color: "#fff",
                    boxShadow: "0 4px 20px 0 rgba(0,0,0,0.15)",
                    fontWeight: "bold",
                    borderRadius: 3,
                    px: 4,
                    py: 1.5,
                    fontSize: 18,
                    letterSpacing: 1,
                    "&:hover": {
                      background: "#1565c0",
                      opacity: 0.95,
                      boxShadow: "0 6px 24px 0 rgba(0,0,0,0.18)",
                    },
                  }}
                >
                  Refresh Location
                </Button>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </Box>
  );
};

export default MapView;
