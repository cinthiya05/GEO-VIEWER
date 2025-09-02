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
  CircularProgress,
} from "@mui/material";
import PreviewIcon from "@mui/icons-material/Visibility";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import html2canvas from "html2canvas";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const Report = () => {
  const [name, setName] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState(""); 
  const [loading, setLoading] = useState(false);

  // Preview handler
  const handlePreview = async () => {
    setLoading(true);
    setResults([]);
    setSummary("");

    try {
      const res = await fetch("http://localhost:5000/sos");
      const json = await res.json();
      let data = json.data;

      // Apply filters
      if (name.trim()) {
        data = data.filter((d) =>
          d.name.toLowerCase().includes(name.toLowerCase())
        );
      }
      if (fromDate) {
        data = data.filter((d) => new Date(d.timestamp) >= new Date(fromDate));
      }
      if (toDate) {
        data = data.filter((d) => new Date(d.timestamp) <= new Date(toDate));
      }

      if (data.length === 0) {
        setSummary("No data available for AI analysis.");
        setResults([]);
        setLoading(false);
        return;
      }

      // Call AI API
      const aiRes = await fetch("http://localhost:5000/ai-report-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ records: data }),
      });

      const aiJson = await aiRes.json();
      setResults(data);
      setSummary(aiJson.summary || "No AI summary available.");
    } catch (err) {
      console.error("Error fetching report:", err);
      setSummary("Error generating AI summary.");
    } finally {
      setLoading(false);
    }
  };

  // PDF generation
  const handleGenerate = async () => {
    if (!results.length) {
      alert("No data to generate report!");
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("SOS Report", 14, 20);

    // Filters
    doc.setFontSize(10);
    doc.text(
      `Filters: Name=${name || "All"}, From=${fromDate || "-"}, To=${toDate || "-"}`,
      14,
      28
    );

    // AI summary
    if (summary) {
      doc.setFontSize(12);
      doc.text("AI Analysis:", 14, 38);
      doc.setFontSize(10);
      const wrappedText = doc.splitTextToSize(summary, 180);
      doc.text(wrappedText, 14, 45);
    }

    // Table
    autoTable(doc, {
      startY: summary ? 55 : 35,
      head: [["ID", "Name", "SOS Type", "Timestamp", "Location"]],
      body: results.map((r) => [
        r.id,
        r.name,
        r.sosType,
        r.timestamp,
        `${r.lat}, ${r.lng}`,
      ]),
    });

    // Graphs (screenshot of preview)
    const previewElement = document.getElementById("report-preview");
    if (previewElement) {
      const canvas = await html2canvas(previewElement);
      const imgData = canvas.toDataURL("image/png");

      let y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 50;
      const pageHeight = doc.internal.pageSize.getHeight();

      if (y + 100 > pageHeight) {
        doc.addPage();
        y = 20;
      }

      const pdfWidth = doc.internal.pageSize.getWidth() - 20;
      const imgProps = doc.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      doc.addImage(imgData, "PNG", 10, y, pdfWidth, pdfHeight);
    }

    doc.save("sos_report.pdf");
  };

  // Graph data
  const sosTypeCounts = results.reduce((acc, r) => {
    acc[r.sosType] = (acc[r.sosType] || 0) + 1;
    return acc;
  }, {});
  const pieData = Object.entries(sosTypeCounts).map(([type, count]) => ({
    name: type,
    value: count,
  }));

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
        📊 SOS Report Module
      </Typography>

      {/* Filter Card */}
      <Card sx={{ width: "100%", maxWidth: 700, p: 2, mb: 3, boxShadow: 4, borderRadius: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Select Filters
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Name" value={name} onChange={(e) => setName(e.target.value)} />
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
                disabled={loading}
              >
                {loading ? <CircularProgress size={18} /> : "Preview"}
              </Button>
              <Button
                fullWidth
                variant="contained"
                color="secondary"
                startIcon={<FileDownloadIcon />}
                onClick={handleGenerate}
                disabled={!results.length}
              >
                Generate
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Report Preview */}
      {!loading && results.length > 0 && (
        <Card id="report-preview" sx={{ width: "100%", maxWidth: 1000, p: 2, boxShadow: 4, borderRadius: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              📑 Report Preview
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {/* AI Summary */}
            {summary && (
              <Box sx={{ mb: 2, p: 2, background: "#fafafa", borderRadius: 2 }}>
                <Typography variant="subtitle2">📝 AI Report Analysis</Typography>
                <Typography variant="body2">{summary}</Typography>
              </Box>
            )}

            {/* Graphs */}
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">SOS Type Distribution</Typography>
                <PieChart width={300} height={250}>
                  <Pie data={pieData} dataKey="value" cx="50%" cy="50%" outerRadius={80} label>
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${idx}`} fill={["#8884d8", "#82ca9d", "#ffc658"][idx % 3]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2">SOS Count by User</Typography>
                <BarChart width={350} height={250} data={results}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="id" fill="#82ca9d" />
                </BarChart>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Report;
