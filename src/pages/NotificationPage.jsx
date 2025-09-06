import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  TablePagination,
  Chip,
  Tooltip,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import SearchIcon from "@mui/icons-material/Search";
import { CSVLink } from "react-csv";

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [searchTerm, setSearchTerm] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [csvFileName, setCsvFileName] = useState("notifications");

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("http://localhost:5000/notifications");
        const notifs = res.data;

        const enriched = await Promise.all(
          notifs.map(async (note) => {
            try {
              const sosRes = await axios.get(
                `http://localhost:5000/sos/${note.sos_id}`
              );
              return { ...note, ...sosRes.data.data };
            } catch (sosErr) {
              console.error("Error fetching SOS for", note.sos_id, sosErr);
              return note;
            }
          })
        );

        setNotifications(enriched);
        setFilteredNotifications(enriched);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to fetch notifications from server");
      }
    };
    fetchNotifications();
  }, []);

  useEffect(() => {
    const filtered = notifications.filter((note) =>
      [note.name, note.contact, note.address]
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
    setFilteredNotifications(filtered);
    setPage(0);
  }, [searchTerm, notifications]);

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  const handleDownload = () => {
    setOpenDialog(true);
  };

  const renderStatus = (emailStatus, smsStatus, whatsappStatus) => (
    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
      <Chip
        label={`Email: ${emailStatus}`}
        color={emailStatus === "sent" ? "success" : "error"}
        size="small"
      />
      <Chip
        label={`SMS: ${smsStatus}`}
        color={smsStatus === "sent" ? "success" : "error"}
        size="small"
      />
      <Chip
        label={`WhatsApp: ${whatsappStatus}`}
        color={whatsappStatus === "sent" ? "success" : "error"}
        size="small"
      />
    </Box>
  );

  return (
    <Box sx={{ p: 3, background: "#f9f9f9", minHeight: "100vh" }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <TextField
            placeholder="Search by name, contact or address"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1 }} />,
            }}
            sx={{ width: "40%" }}
          />
          <Button
            variant="contained"
            color="primary"
            startIcon={<DownloadIcon />}
            onClick={handleDownload}
          >
            Download CSV
          </Button>
        </Box>

        {error && <Box sx={{ color: "red", mb: 2 }}>{error}</Box>}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#1976d2" }}>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>ID</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Name</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Address</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Contact</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Email</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Timestamp</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Status</TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Action</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredNotifications
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((note) => (
                  <TableRow key={note.id} hover>
                    <TableCell>{note.id}</TableCell>
                    <TableCell>{note.name}</TableCell>
                    <TableCell>{note.address}</TableCell>
                    <TableCell>
                      <Chip label={note.contact} color="info" size="small" />
                    </TableCell>
                    <TableCell>{note.email}</TableCell>
                    <TableCell>{note.timestamp || note.notification_sent_at}</TableCell>
                    <TableCell>
                      {renderStatus(
                        note.email_status,
                        note.sms_status,
                        note.whatsapp_status
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="View Notification">
                        <IconButton
                          color="primary"
                          onClick={() =>
                            window.open(note.notification_url, "_blank")
                          }
                        >
                          <VisibilityIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component="div"
          count={filteredNotifications.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 25]}
        />

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
          <DialogTitle>Download CSV</DialogTitle>
          <DialogContent>
            <TextField
              label="File Name"
              value={csvFileName}
              onChange={(e) => setCsvFileName(e.target.value)}
              fullWidth
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <CSVLink
              data={filteredNotifications}
              filename={`${csvFileName}.csv`}
              style={{ textDecoration: "none" }}
            >
              <Button onClick={() => setOpenDialog(false)} variant="contained" color="primary">
                Download
              </Button>
            </CSVLink>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
};

export default NotificationPage;
