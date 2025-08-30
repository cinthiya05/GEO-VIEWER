import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { Box, Typography, Card, CardContent, Divider } from "@mui/material";

const data = [
  { month: "Jan", incidents: 30, alerts: 20 },
  { month: "Feb", incidents: 40, alerts: 25 },
  { month: "Mar", incidents: 35, alerts: 30 },
  { month: "Apr", incidents: 50, alerts: 28 },
  { month: "May", incidents: 60, alerts: 40 },
  { month: "Jun", incidents: 70, alerts: 50 },
];

const pieData = [
  { name: "Safe", value: 400 },
  { name: "Caution", value: 300 },
  { name: "Danger", value: 200 },
];

const COLORS = ["#0088FE", "#FFBB28", "#FF8042"];

const StatsBoard = () => {
  return (
    <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
      <Box sx={{ maxWidth: 1200, width: "100%" }}>
        <Typography variant="h5" gutterBottom textAlign="center" fontWeight="bold">
          📊 Dashboard Statistics
        </Typography>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
            gap: 3,
          }}
        >
          {/* Row 1 */}
          <Card sx={{ width: "100%", aspectRatio: "1 / 1", boxShadow: 6 }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <Typography variant="h6" textAlign="center" gutterBottom>
                Incident Trends
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <Box sx={{ flexGrow: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="incidents" stroke="#8884d8" />
                    <Line type="monotone" dataKey="alerts" stroke="#82ca9d" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ width: "100%", aspectRatio: "1 / 1", boxShadow: 6 }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <Typography variant="h6" textAlign="center" gutterBottom>
                Monthly Alerts
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <Box sx={{ flexGrow: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="incidents" fill="#8884d8" />
                    <Bar dataKey="alerts" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ width: "100%", aspectRatio: "1 / 1", boxShadow: 6 }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <Typography variant="h6" textAlign="center" gutterBottom>
                Safety Distribution
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <Box sx={{ flexGrow: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      label
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          {/* Row 2 */}
          <Card sx={{ width: "100%", aspectRatio: "1 / 1", boxShadow: 6 }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <Typography variant="h6" textAlign="center" gutterBottom>
                Another Line Chart
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <Box sx={{ flexGrow: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="incidents" stroke="#FF8042" />
                    <Line type="monotone" dataKey="alerts" stroke="#0088FE" />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ width: "100%", aspectRatio: "1 / 1", boxShadow: 6 }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <Typography variant="h6" textAlign="center" gutterBottom>
                Another Bar Chart
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <Box sx={{ flexGrow: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="incidents" fill="#82ca9d" />
                    <Bar dataKey="alerts" fill="#FFBB28" />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          <Card sx={{ width: "100%", aspectRatio: "1 / 1", boxShadow: 6 }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <Typography variant="h6" textAlign="center" gutterBottom>
                Another Pie Chart
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <Box sx={{ flexGrow: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      label
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default StatsBoard;
