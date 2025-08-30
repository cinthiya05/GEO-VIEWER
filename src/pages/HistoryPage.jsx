import { useEffect, useState, useRef } from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  IconButton,
  Button,
  Box,
  Stack,
  Tooltip,
  Chip
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import RefreshIcon from '@mui/icons-material/Refresh';
import RoomIcon from '@mui/icons-material/Room';
import GetAppIcon from '@mui/icons-material/GetApp'; // ✅ Download icon

const HistoryPage = () => {
  const [locations, setLocations] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [notifyFlag, setNotifyFlag] = useState(false);
  const lastTriggeredRef = useRef(null);

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
        setLocations(sorted);
      })
      .catch((error) => console.error("❌ Failed to fetch locations:", error));
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (!notifyFlag) return;

    const interval = setInterval(() => {
      if (locations.length === 0) return;

      const latest = locations[0];
      const latestTimestamp = new Date(latest.timestamp).getTime();

      if (lastTriggeredRef.current === latestTimestamp) {
        console.log("⏸️ No new location for notification.");
        return;
      }

      // Step 1: Create SOS event
      const sosPayload = {
        user_id: latest.id,
        name: latest.name,
        address: latest.address,
        contact: latest.contact,
        email: latest.email,
        emergency1: latest.emergency1,
        emergency2: latest.emergency2,
        lat: latest.lat,
        lng: latest.lng,
        timestamp: latest.timestamp,
        sosType: latest.sosType,
      };

      fetch("http://localhost:5000/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sosPayload),
      })
        .then((res) => res.json())
        .then((sosRes) => {
          console.log("🆘 SOS created:", sosRes);

          // Step 2: Send notification
          const notifyUrl = `http://localhost:5000/notify?lat=${latest.lat}&lon=${latest.lng}`;
          fetch(notifyUrl)
            .then((res) => res.json())
            .then((notifyRes) => {
              console.log("✅ Notification sent:", notifyRes);

              lastTriggeredRef.current = latestTimestamp;

              // Step 3: Store notification in DB
              const notificationPayload = {
                sos_id: sosRes.sos_id,
                notification_sent_at: new Date().toISOString(),
                notification_url: notifyRes.notification_url,
                email_status: notifyRes.email_status,
                sms_sid: notifyRes.sms_sid,
                sms_status: notifyRes.sms_status,
                whatsapp_sid: notifyRes.whatsapp_sid,
                whatsapp_status: notifyRes.whatsapp_status,
              };

              fetch("http://localhost:5000/notifications", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(notificationPayload),
              })
                .then((res) => res.json())
                .then((dbRes) => {
                  console.log("📦 Notification stored in DB:", dbRes);
                })
                .catch((err) => {
                  console.error("❌ Failed to store notification:", err);
                });
            })
            .catch((err) => {
              console.error("❌ Failed to send notification:", err);
            });
        })
        .catch((err) => {
          console.error("❌ Failed to create SOS:", err);
        });
    }, 60000); // run every 1 minute

    return () => clearInterval(interval);
  }, [notifyFlag, locations]);

  const toggleNotification = () => {
    setNotifyFlag((prev) => {
      const newState = !prev;
      console.log(`📣 Notify flag set to: ${newState ? 'ON (1)' : 'OFF (0)'}`);
      return newState;
    });
  };

  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  // ✅ Download CSV
  const downloadCSV = () => {
    if (locations.length === 0) {
      alert("No data available to download.");
      return;
    }

    const headers = Object.keys(locations[0]).join(",") + "\n";
    const rows = locations
      .map((row) =>
        Object.values(row)
          .map((val) => `"${val}"`) // Wrap in quotes
          .join(",")
      )
      .join("\n");

    const csvData = headers + rows;
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "location_history.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ px: 2, py: 4 }}>
      <Box sx={{ maxWidth: '100%', mx: 'auto' }}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            Location History
          </Typography>

          <Stack direction="row" spacing={2}>
            <Button
              variant={notifyFlag ? 'contained' : 'outlined'}
              color={notifyFlag ? 'error' : 'primary'}
              onClick={toggleNotification}
            >
              {notifyFlag ? 'Stop Notification (0)' : 'Start Notification (1)'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchLocations}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              startIcon={<GetAppIcon />}
              onClick={downloadCSV}
            >
              Download
            </Button>
          </Stack>
        </Stack>

        {/* Table */}
        <TableContainer component={Paper} sx={{ borderRadius: 3, boxShadow: 3 }}>
          <Table>
            <TableHead sx={{ backgroundColor: '#f1f5f9' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Address</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Email</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Emergency 1</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Emergency 2</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Latitude</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Longitude</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>SOS Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {locations
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      backgroundColor: index % 2 === 0 ? '#ffffff' : '#f8fafc',
                      '&:hover': {
                        backgroundColor: '#e2e8f0',
                      },
                    }}
                  >
                    <TableCell>{row.id}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{row.address}</TableCell>
                    <TableCell>
                      <Chip label={row.contact} color="primary" size="small" />
                    </TableCell>
                    <TableCell>{row.email}</TableCell>
                    <TableCell>{row.emergency1}</TableCell>
                    <TableCell>{row.emergency2}</TableCell>
                    <TableCell>{row.lat}</TableCell>
                    <TableCell>{row.lng}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.sosType}
                        color={
                          row.sosType === 'SOS-Button'
                            ? 'error'
                            : row.sosType === 'SOS-Voice'
                            ? 'primary'
                            : row.sosType === 'SOS-hand-detector'
                            ? 'warning'
                            : 'default'
                        }
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {new Date(row.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View on Google Maps">
                        <IconButton
                          color="primary"
                          component="a"
                          href={`https://www.google.com/maps?q=${row.lat},${row.lng}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <RoomIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={locations.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25]}
            sx={{ px: 2 }}
          />
        </TableContainer>
      </Box>
    </Box>
  );
};

export default HistoryPage;
