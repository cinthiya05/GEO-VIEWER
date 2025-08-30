import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

const data = [
  { name: "Mon", users: 200, alerts: 10 },
  { name: "Tue", users: 300, alerts: 15 },
  { name: "Wed", users: 400, alerts: 8 },
  { name: "Thu", users: 350, alerts: 20 },
  { name: "Fri", users: 500, alerts: 12 },
  { name: "Sat", users: 420, alerts: 18 },
  { name: "Sun", users: 280, alerts: 9 },
];

const LineChartView = () => {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 6, height: 450 }}>
      <CardContent sx={{ height: "100%" }}>
        <Typography variant="h6" gutterBottom>
          Weekly Trends
        </Typography>
        <ResponsiveContainer width="100%" height="90%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="users" stroke="#2196F3" strokeWidth={2} />
            <Line type="monotone" dataKey="alerts" stroke="#FF5722" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default LineChartView;
