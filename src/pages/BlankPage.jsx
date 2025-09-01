import React from "react";
import { Box, Grid, Card, CardMedia, Typography } from "@mui/material";

const BlankPage = () => {
  const images = [
    "https://via.placeholder.com/200?text=Image+1",
    "https://via.placeholder.com/200?text=Image+2",
    "https://via.placeholder.com/200?text=Image+3",
    "https://via.placeholder.com/200?text=Image+4",
    "https://via.placeholder.com/200?text=Image+5",
  ];

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        📸 Sample Images
      </Typography>

      {/* Top row with 3 images */}
      <Grid container spacing={3} justifyContent="center" sx={{ mb: 3 }}>
        {images.slice(0, 3).map((img, index) => (
          <Grid item key={index}>
            <Card
              sx={{
                width: 200,
                height: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 2,
                boxShadow: 3,
              }}
            >
              <CardMedia
                component="img"
                image={img}
                alt={`Image ${index + 1}`}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 2,
                }}
              />
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Bottom row with 2 images */}
      <Grid container spacing={3} justifyContent="center">
        {images.slice(3, 5).map((img, index) => (
          <Grid item key={index}>
            <Card
              sx={{
                width: 200,
                height: 200,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 2,
                boxShadow: 3,
              }}
            >
              <CardMedia
                component="img"
                image={img}
                alt={`Image ${index + 4}`}
                sx={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  borderRadius: 2,
                }}
              />
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default BlankPage;
