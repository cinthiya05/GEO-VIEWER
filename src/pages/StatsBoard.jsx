import React, { useEffect, useState } from "react";
import axios from "axios";
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
import { Box, Typography, Card, CardContent, Divider, Grid } from "@mui/material";

const COLORS = ["#0088FE", "#FFBB28", "#FF8042", "#82ca9d", "#d45087", "#2ca02c"];

const StatsBoard = ({ userId = null }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const url = userId
          ? `http://localhost:5000/dashboard_stats/${userId}`
          : "http://localhost:5000/dashboard_stats";

        const res = await axios.get(url);
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  if (loading) return <Typography textAlign="center">Loading...</Typography>;
  if (!stats) return <Typography textAlign="center">No data available</Typography>;

  // ----------------------------
  // 🔹 Transform data for charts
  // ----------------------------

  // 1. Line Chart: SOS over time
  const lineData = userId
    ? stats.positions?.map((p, idx) => ({
        index: idx + 1,
        timestamp: new Date(p.timestamp).toLocaleString(),
        sos: 1,
      })) || []
    : stats.sos.by_type.map((s, idx) => ({
        month: `T${idx + 1}`,
        incidents: parseInt(s.count, 10),
        alerts: parseInt(stats.notifications.total, 10),
      }));

  // 2. Bar Chart: SOS by Type
  const barData = userId
    ? stats.sos_by_type?.map((s) => ({
        sosType: s.sosType,
        count: parseInt(s.count, 10),
      })) || []
    : stats.sos.by_type.map((s) => ({
        sosType: s.sosType,
        count: parseInt(s.count, 10),
      }));

  // 3. Pie Chart: Users or Notifications
  const pieData = userId
    ? [
        { name: "Email Sent", value: parseInt(stats.notifications.email_sent, 10) },
        { name: "SMS Sent", value: parseInt(stats.notifications.sms_sent, 10) },
        { name: "WhatsApp Sent", value: parseInt(stats.notifications.whatsapp_sent, 10) },
      ]
    : [
        { name: "Active Users", value: stats.users.active },
        { name: "Inactive Users", value: stats.users.inactive },
      ];

  // 4. Summary cards (KPIs + SOS type counts in the same row)
  const summaryCards = userId
    ? [
        { title: "Total SOS", value: stats.total_sos, color: "#0088FE" },
        { title: "Total Notifications", value: stats.notifications.total_notifications, color: "#FF8042" },
        ...barData.map((s, idx) => ({
          title: s.sosType,
          value: s.count,
          color: COLORS[idx % COLORS.length],
        })),
      ]
    : [
        { title: "Total Users", value: stats.users.total, color: "#0088FE" },
        { title: "Total SOS", value: stats.sos.total, color: "#FF8042" },
        { title: "Total Notifications", value: stats.notifications.total, color: "#82ca9d" },
        ...barData.map((s, idx) => ({
          title: s.sosType,
          value: s.count,
          color: COLORS[idx % COLORS.length],
        })),
      ];

  return (
    <Box sx={{ p: 3, display: "flex", justifyContent: "center" }}>
      <Box sx={{ maxWidth: 1400, width: "100%" }}>
        <Typography variant="h5" gutterBottom textAlign="center" fontWeight="bold">
          📊 Dashboard Statistics {userId && `(User: ${userId})`}
        </Typography>

        {/* Unified Summary Row (KPIs + SOS type counts) */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {summaryCards.map((card, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Card
                sx={{
                  textAlign: "center",
                  p: 2,
                  boxShadow: 3,
                  borderTop: `4px solid ${card.color}`,
                }}
              >
                <Typography variant="subtitle1">{card.title}</Typography>
                <Typography variant="h5" fontWeight="bold" color="primary">
                  {card.value}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Charts */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
            gap: 3,
          }}
        >
          {/* Line Chart */}
          <Card sx={{ width: "100%", aspectRatio: "1 / 1", boxShadow: 6 }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <Typography variant="h6" textAlign="center" gutterBottom>
                SOS Timeline
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <Box sx={{ flexGrow: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey={userId ? "timestamp" : "month"} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey={userId ? "sos" : "incidents"}
                      stroke="#8884d8"
                    />
                    {!userId && (
                      <Line type="monotone" dataKey="alerts" stroke="#82ca9d" />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card sx={{ width: "100%", aspectRatio: "1 / 1", boxShadow: 6 }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <Typography variant="h6" textAlign="center" gutterBottom>
                SOS by Type
              </Typography>
              <Divider sx={{ mb: 1 }} />
              <Box sx={{ flexGrow: 1 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="sosType" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count">
                      {barData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>

          {/* Pie Chart */}
          <Card sx={{ width: "100%", aspectRatio: "1 / 1", boxShadow: 6 }}>
            <CardContent sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
              <Typography variant="h6" textAlign="center" gutterBottom>
                {userId ? "Notification Sent Breakdown" : "User Distribution"}
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
