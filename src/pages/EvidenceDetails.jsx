import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { PlayCircle } from "@mui/icons-material";

// Leaflet
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const EvidenceDetails = () => {
  const { id } = useParams();
  const [sos, setSos] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`http://localhost:5000/sos/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setSos(data.data);
        console.log("Fetched SOS details:", data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Fetch failed:", err);f
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!sos) {
    return (
      <Typography sx={{ mt: 5, textAlign: "center" }}>
        No data found
      </Typography>
    );
  }

  // fallback for backend fields (sometimes lat/lng, sometimes latitude/longitude)
  const latitude = sos.lat || sos.latitude;
  const longitude = sos.lng || sos.longitude;

  return (
    <Box
      sx={{
        p: 4,
        minHeight: "100vh",
        background: "linear-gradient(135deg, #ece9e6, #ffffff)",
      }}
    >
      <Typography
        variant="h4"
        sx={{ mb: 4, fontWeight: "bold", textAlign: "center" }}
      >
        🛡️ Evidence Details (ID: {sos.id})
      </Typography>

      <Grid container spacing={3}>
        {/* LEFT COLUMN */}
        <Grid item xs={12} md={6}>
          {/* Event Info */}
          <Card
            sx={{
              mb: 3,
              borderRadius: 4,
              backdropFilter: "blur(10px)",
              background: "rgba(255,255,255,0.7)",
              boxShadow: "0 8px 32px rgba(31,38,135,0.2)",
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                📌 Event Details
              </Typography>
              <List>
                <ListItem>
                  <ListItemText primary="Name" secondary={sos.name} />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText primary="Contact" secondary={sos.contact} />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="SOS Type"
                    secondary={sos.sosType || "N/A"}
                  />
                </ListItem>
                <Divider />
                <ListItem>
                  <ListItemText
                    primary="Timestamp"
                    secondary={sos.timestamp}
                  />
                </ListItem>
              </List>
            </CardContent>
          </Card>

          {/* Media Evidence */}
          <Card
            sx={{
              mb: 3,
              borderRadius: 4,
              backdropFilter: "blur(10px)",
              background: "rgba(255,255,255,0.7)",
              boxShadow: "0 8px 32px rgba(31,38,135,0.2)",
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                🎥 Media Evidence
              </Typography>
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                {sos.media?.map((m, idx) =>
                  m.media_type === "photo" ? (
                    <Avatar
                      key={idx}
                      src={m.media_data}
                      variant="rounded"
                      sx={{
                        width: 100,
                        height: 100,
                        border: "2px solid #ddd",
                        cursor: "pointer",
                        boxShadow: 2,
                        "&:hover": { transform: "scale(1.08)" },
                        transition: "0.2s",
                      }}
                    />
                  ) : m.media_type === "voice" ? (
                    <Chip
                      key={idx}
                      icon={<PlayCircle />}
                      label="Voice Evidence"
                      color="secondary"
                      variant="outlined"
                      clickable
                      onClick={() => {
                        const audio = new Audio(m.media_data);
                        audio.play();
                      }}
                      sx={{
                        fontWeight: "bold",
                        background: "#f0f4ff",
                      }}
                    />
                  ) : null
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card
            sx={{
              borderRadius: 4,
              backdropFilter: "blur(10px)",
              background: "rgba(255,255,255,0.7)",
              boxShadow: "0 8px 32px rgba(31,38,135,0.2)",
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                🔔 Notifications
              </Typography>
              {sos.notifications?.length > 0 ? (
                <List>
                  {sos.notifications.map((n) => (
                    <React.Fragment key={n.id}>
                      <ListItem>
                        <ListItemText
                          primary={`Sent at: ${
                            n.notification_sent_at || "N/A"
                          }`}
                          secondary={`Email: ${n.email_status}, SMS: ${n.sms_status}, WhatsApp: ${n.whatsapp_status}`}
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography>No notifications found</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* RIGHT COLUMN - LEAFLET MAP */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: 4,
              height: "100%",
              backdropFilter: "blur(10px)",
              background: "rgba(255,255,255,0.7)",
              boxShadow: "0 8px 32px rgba(31,38,135,0.2)",
            }}
          >
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: "bold" }}>
                🗺️ Location
              </Typography>
              {latitude && longitude ? (
                <MapContainer
                  center={[latitude, longitude]}
                  zoom={15}
                  style={{ height: "400px", width: "100%", borderRadius: "12px" }}
                >
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[latitude, longitude]}>
                    <Popup>
                      {sos.name} - {sos.sosType}
                    </Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <Typography>No location available</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default EvidenceDetails;
