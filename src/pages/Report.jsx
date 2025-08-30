import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import PreviewIcon from "@mui/icons-material/Visibility";
import FileDownloadIcon from "@mui/icons-material/FileDownload";

const Report = () => {
  const [name, setName] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [results, setResults] = useState([]);

  // Preview report (fetch data to display)
  const handlePreview = async () => {
    if (!fromDate || !toDate) {
      alert("Please select both dates");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:5000/history?from=${fromDate}&to=${toDate}&name=${name}`
      );
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error("Error fetching report:", err);
    }
  };

  // Generate report (example: download CSV or PDF)
  const handleGenerate = () => {
    if (results.length === 0) {
      alert("Please preview the report first");
      return;
    }

    // Example: convert results to CSV and download
    const csvHeader = "Name,Latitude,Longitude,Timestamp\n";
    const csvRows = results
      .map((item) => `${item.name},${item.lat},${item.lon},${item.timestamp}`)
      .join("\n");

    const blob = new Blob([csvHeader + csvRows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "report.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f7fa",
      }}
    >
      <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", mb: 2 }}>
        📊 Report Module
      </Typography>

      <Card
        sx={{
          width: "100%",
          maxWidth: 700,
          p: 2,
          mb: 3,
          boxShadow: 4,
          borderRadius: 3,
        }}
      >
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Select Filters
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="date"
                label="From Date"
                InputLabelProps={{ shrink: true }}
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                type="date"
                label="To Date"
                InputLabelProps={{ shrink: true }}
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={2} sx={{ display: "flex", gap: 1 }}>
              <Button
                fullWidth
                variant="outlined"
                color="primary"
                startIcon={<PreviewIcon />}
                onClick={handlePreview}
              >
                Preview
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                startIcon={<FileDownloadIcon />}
                onClick={handleGenerate}
              >
                Generate
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {results.length > 0 && (
        <Card
          sx={{
            width: "100%",
            maxWidth: 800,
            p: 2,
            boxShadow: 4,
            borderRadius: 3,
          }}
        >
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Report Results
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {results.map((item, index) => (
              <Box
                key={index}
                sx={{
                  mb: 2,
                  p: 2,
                  borderRadius: 2,
                  backgroundColor: "#eef2f7",
                }}
              >
                <Typography variant="body1">
                  👤 Name: {item.name || "N/A"}
                </Typography>
                <Typography variant="body1">
                  📍 Location: {item.lat}, {item.lon}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  🕒 Time: {item.timestamp}
                </Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Report;
