import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Paper,
  Avatar,
  IconButton,
  Chip,
  Divider,
} from "@mui/material";
import { Visibility } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const EvidencePage = () => {
  const [sosData, setSosData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:5000/sos-media-evidence")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "success") {
          setSosData(data.data);
        }
      })
      .catch((err) => console.error("❌ Fetch failed:", err));
  }, []);

  // Function to return colored Chip based on SOS type
  const getSosChip = (type) => {
    let color = "default";
    if (type?.toLowerCase().includes("hand")) color = "error"; // red
    else if (type?.toLowerCase().includes("voice")) color = "warning"; // orange

    return <Chip label={type} color={color} variant="filled" />;
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
        🛡️ SOS Evidence Records
      </Typography>

      <Paper elevation={3} sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#f5f5f5" }}>
              <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>SOS Type</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Evidence</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sosData.map((sos, rowIndex) => (
              <TableRow
                key={sos.id}
                sx={{
                  backgroundColor: rowIndex % 2 === 0 ? "#fafafa" : "white",
                }}
              >
                {/* Name */}
                <TableCell>{sos.name}</TableCell>

                {/* Contact */}
                <TableCell>{sos.contact}</TableCell>

                {/* SOS Type with colored Chip */}
                <TableCell>{getSosChip(sos.sosType)}</TableCell>

                {/* Evidence column */}
                <TableCell>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      gap: 2,
                      flexWrap: "wrap",
                      alignItems: "center",
                    }}
                  >
                    {sos.media?.map((m, idx) => (
                      <React.Fragment key={idx}>
                        {m.media_type === "photo" ? (
                          <Avatar
                            src={m.media_data}
                            variant="rounded"
                            sx={{
                              width: 64,
                              height: 64,
                              border: "1px solid #ddd",
                              cursor: "pointer",
                              boxShadow: 1,
                              "&:hover": { transform: "scale(1.05)" },
                              transition: "0.2s",
                            }}
                          />
                        ) : m.media_type === "voice" ? (
                          <Box key={idx}>
                            <audio controls src={m.media_data} />
                          </Box>
                        ) : null}
                        {idx < sos.media.length - 1 && (
                          <Divider
                            orientation="vertical"
                            flexItem
                            sx={{ mx: 1 }}
                          />
                        )}
                      </React.Fragment>
                    ))}
                  </Box>
                </TableCell>

                {/* Actions */}
                <TableCell>
                  <IconButton
                    color="primary"
                    onClick={() => navigate(`/evidence/${sos.id}`)}
                  >
                    <Visibility />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
};

export default EvidencePage;
