import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Box,
  Button,
  Card,
  Container,
  TextField,
  Typography,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';

const AISuggestionPage = () => {
  const [locations, setLocations] = useState([]);
  const [latestLat, setLatestLat] = useState(null);
  const [latestLon, setLatestLon] = useState(null);

  const [suggestionLoading, setSuggestionLoading] = useState(false);
  const [suggestionData, setSuggestionData] = useState(null);
  const [suggestionError, setSuggestionError] = useState('');

  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatResponse, setChatResponse] = useState('');
  const [chatError, setChatError] = useState('');

  // Fetch locations from Firebase
  const fetchLocations = () => {
    fetch('https://alert-buddy-tracker-default-rtdb.firebaseio.com/locations.json')
      .then((res) => res.json())
      .then((data) => {
        const parsedData = Object.entries(data || {}).map(([key, value]) => ({
          id: key,
          ...value,
        }));
        const sorted = parsedData.sort(
          (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        );
        console.log(sorted)
        setLocations(sorted);

        // Store latest coordinates
        if (sorted.length > 0) {
          console.log(sorted[0].lat)
          setLatestLat(sorted[0].lat);
          setLatestLon(sorted[0].lng);
        }
      })
      .catch((error) => console.error('❌ Failed to fetch locations:', error));
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleFetchSuggestions = async () => {
    if (!latestLat || !latestLon) {
      setSuggestionError('No latest location available.');
      return;
    }

    setSuggestionLoading(true);
    setSuggestionError('');
    setSuggestionData(null);

    try {
      const response = await axios.get(
        `http://localhost:5000/ai-suggestion?lat=${latestLat}&lon=${latestLon}`
      );
      setSuggestionData(response.data);
    } catch (err) {
      console.error(err);
      setSuggestionError('Failed to fetch AI suggestions.');
    } finally {
      setSuggestionLoading(false);
    }
  };


  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      {/* SECTION 1: AI SUGGESTION */}
      <Card
        variant="outlined"
        sx={{
          p: 3,
          mb: 4,
          backgroundColor: '#ffe5e5',
          boxShadow: '0px 4px 20px rgba(255, 0, 0, 0.3)',
          borderRadius: 3,
        }}
      >
        <Typography
          variant="h4"
          gutterBottom
          sx={{ color: '#b71c1c', fontWeight: 'bold' }}
        >
          🚨 AI Safety Suggestion
        </Typography>

        <Button
          variant="contained"
          onClick={handleFetchSuggestions}
          disabled={suggestionLoading}
          sx={{
            backgroundColor: '#d32f2f',
            '&:hover': { backgroundColor: '#b71c1c' },
          }}
        >
          {suggestionLoading ? <CircularProgress size={24} /> : 'Get Suggestion'}
        </Button>

        {suggestionError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {suggestionError}
          </Alert>
        )}

        {suggestionData && (
          <Box sx={{ mt: 4 }}>
            <Paper
              elevation={3}
              sx={{
                p: 2,
                backgroundColor: '#ffebee',
                borderRadius: 2,
              }}
            >
              {/* Safety Tips */}
              {suggestionData.safety_tips?.length > 0 && (
                <>
                  <Typography
                    variant="subtitle1"
                    gutterBottom
                    sx={{ fontWeight: 'bold', color: '#c62828' }}
                  >
                    AI Safety Tips:
                  </Typography>
                  <Box component="ul" sx={{ pl: 3 }}>
                    {suggestionData.safety_tips.map((tip, idx) => (
                      <li key={idx}>
                        <Typography variant="body2">• {tip}</Typography>
                      </li>
                    ))}
                  </Box>
                </>
              )}

              {/* Help Places */}
              {suggestionData.help_places && (
                <>
                  <Typography
                    variant="subtitle1"
                    sx={{ mt: 2, fontWeight: 'bold', color: '#c62828' }}
                  >
                    Nearby Help Centers:
                  </Typography>
                  <Box component="ul" sx={{ pl: 3 }}>
                    {Object.entries(suggestionData.help_places).map(([type, list]) =>
                      list.map((place, idx) => (
                        <li key={`${type}-${idx}`}>
                          <Typography variant="body2">• {place}</Typography>
                        </li>
                      ))
                    )}
                  </Box>
                </>
              )}

              {/* Location */}
              {suggestionData.location && (
                <Typography variant="caption" sx={{ mt: 2, display: 'block' }}>
                  📍 <strong>Location:</strong>{' '}
                  {suggestionData.location.city}, {suggestionData.location.state}
                </Typography>
              )}
            </Paper>
          </Box>
        )}
      </Card>


    </Container>
  );
};

export default AISuggestionPage;
