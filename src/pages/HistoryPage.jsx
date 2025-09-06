import { useEffect, useState, useRef } from "react";
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
  Chip,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import RoomIcon from "@mui/icons-material/Room";
import GetAppIcon from "@mui/icons-material/GetApp";

const HistoryPage = () => {
  const [locations, setLocations] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [notifyFlag, setNotifyFlag] = useState(false);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);
  const [downloadFileName, setDownloadFileName] = useState("location_history.csv");
  const [searchName, setSearchName] = useState("");
  const lastTriggeredRef = useRef(null);

  // Snackbar state
  const [snackbar, setSnackbar] = useState({
    open: false,
    severity: "success",
    message: "",
  });

  const showSnackbar = (severity, message) => {
    setSnackbar({ open: true, severity, message });
  };

  /** 🔹 Fetch from Firebase */
  const fetchLocations = () => {
    fetch(
      "https://alert-buddy-tracker-default-rtdb.firebaseio.com/locations.json"
    )
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
      .catch((error) => {
        console.error("❌ Failed to fetch locations:", error);
        showSnackbar("error", "❌ Failed to fetch locations.");
      });
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  /** 🔹 Notification effect */
  useEffect(() => {
    if (!notifyFlag) return;

    const interval = setInterval(() => {
      if (locations.length === 0) return;

      const latest = locations[0];
      const latestTimestamp = new Date(latest.timestamp).getTime();

      // Prevent duplicate trigger
      if (lastTriggeredRef.current === latestTimestamp) return;

      // Step 1: Create SOS payload
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
        photo: latest.photos || null,
        voice: latest.voice || null,
      };

      fetch("http://localhost:5000/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sosPayload),
      })
        .then((res) => res.json())
        .then((sosRes) => {
          if (sosRes.sos_id) {
            showSnackbar("success", "✅ SOS saved successfully!");
          } else {
            showSnackbar("error", "❌ SOS insert failed.");
            return;
          }

          // Step 2: Send notification
          const notifyUrl = `http://localhost:5000/notify?lat=${latest.lat}&lon=${latest.lng}&name=${encodeURIComponent(latest.name)}&phone_number=${encodeURIComponent(latest.contact)}`;
          fetch(notifyUrl)
            .then((res) => res.json())
            .then((notifyRes) => {
              showSnackbar("success", "📩 Notification sent!");

              lastTriggeredRef.current = latestTimestamp;

              // Step 3: Store notification log
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
                .then(() => {
                  showSnackbar("success", "📦 Notification log stored!");
                })
                .catch((err) => {
                  console.error("❌ Notification DB Insert Failed:", err);
                  showSnackbar(
                    "error",
                    "❌ Failed to store notification log."
                  );
                });
            })
            .catch((err) => {
              console.error("❌ Failed to send notification:", err);
              showSnackbar("error", "❌ Notification sending failed.");
            });
        })
        .catch((err) => {
          console.error("❌ Failed to create SOS:", err);
          showSnackbar("error", "❌ SOS creation failed.");
        });
    }, 10000); // every 10s

    return () => clearInterval(interval);
  }, [notifyFlag, locations]);

  /** 🔹 Toggle Notification */
  const toggleNotification = () => {
    setNotifyFlag((prev) => {
      const newState = !prev;
      showSnackbar(
        "info",
        `📣 Notification ${newState ? "started" : "stopped"}`
      );
      return newState;
    });
  };

  /** 🔹 Pagination */
  const handleChangePage = (_, newPage) => setPage(newPage);
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  /** 🔹 Download CSV */
  const handleDownloadClick = () => {
    setDownloadDialogOpen(true);
  };

  const handleDownloadConfirm = () => {
    downloadCSV(downloadFileName);
    setDownloadDialogOpen(false);
  };

  const handleDownloadCancel = () => {
    setDownloadDialogOpen(false);
  };

  const downloadCSV = (fileName = "location_history.csv") => {
    if (locations.length === 0) {
      showSnackbar("warning", "⚠️ No data available to download.");
      return;
    }

    // Only include columns shown in the table
    const columns = [
      "name",
      "address",
      "contact",
      "email",
      "emergency1",
      "emergency2",
      "lat",
      "lng",
      "sosType",
      "timestamp",
    ];
    const headers = columns.join(",") + "\n";
    const rows = locations
      .map((row) => columns.map((col) => `"${row[col] ?? ""}"`).join(","))
      .join("\n");

    const csvData = headers + rows;
    const blob = new Blob([csvData], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Box sx={{ px: 2, py: 4 }}>
      <Box sx={{ maxWidth: "100%", mx: "auto" }}>
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={2}
        >
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            Location History
          </Typography>
          <Stack direction="row" spacing={2} alignItems="center">
            <TextField
              label="Search by Name"
              variant="outlined"
              value={searchName}
              onChange={e => setSearchName(e.target.value)}
              size="small"
              sx={{
                minWidth: 200,
                background: '#fff',
                boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)",
                borderRadius: 2,
                fontWeight: "bold",
                color: '#fff',
                '& .MuiOutlinedInput-input': {
                  color: '#000',
                },
                '& .MuiOutlinedInput-root': {
                  background: '#fff',
                  '& fieldset': {
                    borderColor: '#6a82fb',
                  },
                  '&:hover fieldset': {
                    borderColor: '#fc5c7d',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#56ab2f',
                  },
                },
              }}
            />
            <Button
              variant="contained"
              color={notifyFlag ? "error" : "success"}
              onClick={toggleNotification}
              sx={{
                background: notifyFlag
                  ? "linear-gradient(90deg, #ff416c 0%, #ff4b2b 100%)"
                  : "linear-gradient(90deg, #56ab2f 0%, #a8e063 100%)",
                color: "#fff",
                boxShadow: "0 4px 20px 0 rgba(0,0,0,0.15)",
                fontWeight: "bold",
                borderRadius: 2,
                px: 3,
                py: 1.2,
                '&:hover': {
                  opacity: 0.9,
                  boxShadow: "0 6px 24px 0 rgba(0,0,0,0.18)"
                }
              }}
            >
              {notifyFlag ? "Stop Notification (0)" : "Start Notification (1)"}
            </Button>
            <Button
              variant="contained"
              color="info"
              startIcon={<RefreshIcon />}
              onClick={fetchLocations}
              sx={{
                background: "linear-gradient(90deg, #2193b0 0%, #6dd5ed 100%)",
                color: "#fff",
                boxShadow: "0 4px 20px 0 rgba(0,0,0,0.15)",
                fontWeight: "bold",
                borderRadius: 2,
                px: 3,
                py: 1.2,
                '&:hover': {
                  opacity: 0.9,
                  boxShadow: "0 6px 24px 0 rgba(0,0,0,0.18)"
                }
              }}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<GetAppIcon />}
              onClick={handleDownloadClick}
              sx={{
                background: "linear-gradient(90deg, #fc5c7d 0%, #6a82fb 100%)",
                color: "#fff",
                boxShadow: "0 4px 20px 0 rgba(0,0,0,0.15)",
                fontWeight: "bold",
                borderRadius: 2,
                px: 3,
                py: 1.2,
                '&:hover': {
                  opacity: 0.9,
                  boxShadow: "0 6px 24px 0 rgba(0,0,0,0.18)"
                }
              }}
            >
              Download
            </Button>
          </Stack>
        </Stack>

        {/* Table */}
        <TableContainer
          component={Paper}
          sx={{ borderRadius: 3, boxShadow: 3 }}
        >
          <Table>
            <TableHead sx={{ backgroundColor: "#f1f5f9" }}>
              <TableRow>
                {/* Removed ID column */}
                <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Address</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Contact</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Email</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Emergency 1</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Emergency 2</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Latitude</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Longitude</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>SOS Type</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Timestamp</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Action</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {locations
                .filter(row => row.name?.toLowerCase().includes(searchName.toLowerCase()))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow
                    key={row.id}
                    sx={{
                      backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafc",
                      "&:hover": { backgroundColor: "#e2e8f0" },
                    }}
                  >
                    {/* Removed ID cell */}
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
                          row.sosType === "SOS-Button"
                            ? "error"
                            : row.sosType === "SOS-Voice"
                            ? "primary"
                            : row.sosType === "SOS-hand-detector"
                            ? "warning"
                            : "default"
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

      {/* Snackbar Notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Download Dialog */}
      <Dialog open={downloadDialogOpen} onClose={handleDownloadCancel}>
        <DialogTitle>Download CSV</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="File Name"
            type="text"
            fullWidth
            value={downloadFileName}
            onChange={e => setDownloadFileName(e.target.value)}
            helperText="Include .csv extension"
            sx={{
              background: '#fff',
              boxShadow: "0 2px 8px 0 rgba(0,0,0,0.10)",
              borderRadius: 2,
              fontWeight: "bold",
              color: '#000',
              '& .MuiOutlinedInput-input': {
                color: '#000',
              },
              '& .MuiOutlinedInput-root': {
                background: '#fff',
                '& fieldset': {
                  borderColor: '#6a82fb',
                },
                '&:hover fieldset': {
                  borderColor: '#fc5c7d',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#56ab2f',
                },
              },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDownloadCancel} color="error">Cancel</Button>
          <Button
            onClick={handleDownloadConfirm}
            variant="contained"
            sx={{
              background: "linear-gradient(90deg, #fc5c7d 0%, #6a82fb 100%)",
              color: "#fff",
              boxShadow: "0 4px 20px 0 rgba(0,0,0,0.15)",
              fontWeight: "bold",
              borderRadius: 2,
              px: 3,
              py: 1.2,
              '&:hover': {
                opacity: 0.9,
                boxShadow: "0 6px 24px 0 rgba(0,0,0,0.18)"
              }
            }}
          >
            Download
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HistoryPage;
