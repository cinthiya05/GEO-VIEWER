import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { PieChart, Pie, Tooltip, Cell, Legend, ResponsiveContainer } from "recharts";

const data = [
  { name: "Users", value: 1245 },
  { name: "Active Today", value: 320 },
  { name: "Alerts", value: 58 },
  { name: "Resolved", value: 42 },
];

const COLORS = ["#4CAF50", "#2196F3", "#FF5722", "#9C27B0"];

const PieChartView = () => {
  return (
    <Card sx={{ borderRadius: 3, boxShadow: 6, height: 450 }}>
      <CardContent sx={{ height: "100%" }}>
        <Typography variant="h6" gutterBottom>
          Distribution Overview
        </Typography>
        <ResponsiveContainer width="100%" height="90%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={130}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default PieChartView;
