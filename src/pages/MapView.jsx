import React, { useEffect, useState } from "react";
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
  const [mapInstance, setMapInstance] = useState(null);

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

        if (mapInstance) {
          mapInstance.setView([latest.lat, latest.lng], 15);
          L.marker([latest.lat, latest.lng])
            .addTo(mapInstance)
            .bindPopup(
              `Live Location:<br/>Lat: ${latest.lat}<br/>Lng: ${latest.lng}`
            )
            .openPopup();
        }
      }
    } catch (error) {
      console.error("Error fetching location:", error);
    }
  };

  useEffect(() => {
    const mapContainer = document.getElementById("map");
    if (mapContainer && mapContainer._leaflet_id != null) {
      mapContainer._leaflet_id = null;
    }

    const map = L.map("map").setView([20.5937, 78.9629], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
    }).addTo(map);

    setMapInstance(map);
  }, []);

  useEffect(() => {
    if (mapInstance) {
      fetchLocation();
    }
  }, [mapInstance]);

  // 🔹 Card data configuration (icon + color)
  const cardConfig = [
    {
      key: "name",
      label: "Name",
      icon: <PersonIcon />,
      color: "#E3F2FD",
    },
    {
      key: "email",
      label: "Email",
      icon: <EmailIcon />,
      color: "#FFF3E0",
    },
    {
      key: "contact",
      label: "Contact",
      icon: <PhoneIcon />,
      color: "#E8F5E9",
    },
    {
      key: "emergency1",
      label: "Emergency Contact 1",
      icon: <ContactPhoneIcon />,
      color: "#F3E5F5",
    },
    {
      key: "emergency2",
      label: "Emergency Contact 2",
      icon: <ContactPhoneIcon />,
      color: "#FFEBEE",
    },
    {
      key: "address",
      label: "Address",
      icon: <LocationOnIcon />,
      color: "#E0F7FA",
    },
    {
      key: "sosType",
      label: "SOS Type",
      icon: <WarningIcon />,
      color: "#FFF9C4",
    },
  ];

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f9f9f9",
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 1000, width: "100%", boxShadow: 6 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom textAlign="center">
            Live Location Map
          </Typography>

          {/* Location Info + Google Maps button */}
          {location && (
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              spacing={2}
            >
              <Typography variant="body1">
                Latitude: {location.lat}, Longitude: {location.lng}
              </Typography>
              <Tooltip title="View in Google Maps">
                <IconButton
                  color="primary"
                  component="a"
                  href={`https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <VisibilityIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          )}

          {/* Map */}
          <Box
            id="map"
            sx={{
              height: "400px",
              width: "100%",
              border: "2px solid #ccc",
              borderRadius: 2,
              mt: 2,
            }}
          />

          {/* Refresh Button */}
          <Box display="flex" justifyContent="center" mt={2}>
            <Button variant="contained" color="primary" onClick={fetchLocation}>
              Refresh Location
            </Button>
          </Box>

          {/* 🔹 Latest Data Cards */}
          {latestData && (
            <Box mt={4}>
              <Typography variant="h6" gutterBottom>
                User Details
              </Typography>
              <Grid container spacing={2}>
                {cardConfig.map(
                  ({ key, label, icon, color }) =>
                    latestData[key] && (
                      <Grid item xs={12} sm={6} md={4} key={key}>
                        <Card
                          sx={{
                            backgroundColor: color,
                            borderRadius: 3,
                            boxShadow: 3,
                          }}
                        >
                          <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            {icon}
                            <Box>
                              <Typography variant="subtitle2" color="text.secondary">
                                {label}
                              </Typography>
                              <Typography variant="body1">{latestData[key]}</Typography>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    )
                )}
              </Grid>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default MapView;
