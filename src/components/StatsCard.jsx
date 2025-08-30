import React from "react";
import { Card, CardContent, Typography } from "@mui/material";

const StatsCard = ({ title, value }) => {
  return (
    <Card
      sx={{
        borderRadius: 4,
        boxShadow: 6,
        textAlign: "center",
        transition: "0.3s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: 10,
        },
      }}
    >
      <CardContent>
        <Typography variant="subtitle2" color="textSecondary" gutterBottom>
          {title}
        </Typography>
        <Typography variant="h4" fontWeight="bold" color="primary">
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
