import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import PanToolIcon from "@mui/icons-material/PanTool";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

const features = [
  {
    title: "SOS",
    icon: <TouchAppIcon sx={{ fontSize: 50, color: "#d32f2f" }} />,
    guideline: [
      "Tap the SOS button in emergencies.",
      "Your location (latitude & longitude) will be shared instantly.",
      "Location will also appear on the live safety map.",
      "Ensure your GPS is enabled for accurate location tracking.",
      "SOS alerts are sent to your pre-registered contacts.",
      "Keep your internet connection active for faster response.",
      "Avoid accidental presses by locking your device when not needed.",
    ],
  },
  {
    title: "Gesture",
    icon: <PanToolIcon sx={{ fontSize: 50, color: "#1976d2" }} />,
    guideline: [
      "Show 5 fingers clearly in front of the camera.",
      "The AI will detect the gesture automatically.",
      "Your location is sent to contacts and shown on the map.",
      "Make sure your hand is well-lit and visible to the camera.",
      "Hold your gesture steady for 2–3 seconds for detection.",
      "Avoid background movements to reduce false triggers.",
      "Practice the gesture to improve recognition accuracy.",
    ],
  },
  {
    title: "Voice",
    icon: <KeyboardVoiceIcon sx={{ fontSize: 50, color: "#388e3c" }} />,
    guideline: [
      'Say "Help" loudly and clearly.',
      "The system captures your voice instantly.",
      "Your live location will be sent to the dashboard.",
      "Speak in a quiet environment for best results.",
      "Ensure microphone permission is granted to the app.",
      "Repeat the command if not detected the first time.",
      "Use a strong, firm tone to trigger faster recognition.",
    ],
  },
];

const Guidelines = () => {
  const [selected, setSelected] = useState(null);

  return (
    <Box
      sx={{
        maxWidth: 700,
        margin: "auto",
        mt: 5,
        p: 2,
      }}
    >
      {/* If nothing selected → show cards */}
      {!selected && (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gridTemplateRows: "repeat(2, 200px)",
            gap: 2,
          }}
        >
          {features.map((f, idx) => (
            <Box
              key={idx}
              onClick={() => setSelected(f)}
              sx={{
                gridColumn: idx === 2 ? "1 / span 2" : "auto",
                bgcolor: "#f5f5f5",
                borderRadius: 2,
                boxShadow: 3,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                "&:hover": { boxShadow: 6, bgcolor: "#e0e0e0" },
              }}
            >
              {f.icon}
              <Typography variant="h6" sx={{ mt: 1 }}>
                {f.title}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* If a feature is selected → show guidelines */}
      {selected && (
        <Box
          sx={{
            bgcolor: "#f9f9f9",
            p: 3,
            borderRadius: 2,
            boxShadow: 4,
          }}
        >
          <Typography
            variant="h5"
            sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1 }}
          >
            {selected.icon} {selected.title} Guidelines
          </Typography>

          {selected.guideline.map((point, i) => (
            <Typography key={i} variant="body1" sx={{ mb: 1 }}>
              • {point}
            </Typography>
          ))}

          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            sx={{ mt: 3 }}
            onClick={() => setSelected(null)}
          >
            Back
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default Guidelines;
