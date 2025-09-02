import { useEffect, useState } from "react";
import axios from "axios";
import {
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
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  // Fetch notifications and join with SOS details
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("http://localhost:5000/notifications");
        const notifs = res.data;

        // Fetch sos details for each notification
        const enriched = await Promise.all(
          notifs.map(async (note) => {
            try {
              const sosRes = await axios.get(
                `http://localhost:5000/sos/id/${note.sos_id}`
              );
              console.log("Fetched SOS:", sosRes.data);
              return { ...note, ...sosRes.data.data }; // merge notification + sos details
            } catch (sosErr) {
              console.error("Error fetching SOS for", note.sos_id, sosErr);
              return note; // fallback: keep original
            }
          })
        );

        setNotifications(enriched);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError("Failed to fetch notifications from server");
      }
    };
    fetchNotifications();
  }, []);

  // Pagination handlers
  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (e) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  // Status rendering
  const renderStatus = (emailStatus, smsStatus, whatsappStatus) => (
    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
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
    </div>
  );

  return (
    <Paper sx={{ padding: 2 }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
        Notifications
      </h1>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><b>ID</b></TableCell>
              <TableCell><b>Name</b></TableCell>
              <TableCell><b>Address</b></TableCell>
              <TableCell><b>Contact</b></TableCell>
              <TableCell><b>Email</b></TableCell>
              <TableCell><b>Timestamp</b></TableCell>
              <TableCell><b>Status</b></TableCell>
              <TableCell><b>Action</b></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {notifications
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((note) => (
                <TableRow key={note.id}>
                  <TableCell>{note.id}</TableCell>
                  <TableCell>{note.name}</TableCell>
                  <TableCell>{note.address}</TableCell>
                  <TableCell>{note.contact}</TableCell>
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

      {/* Pagination */}
      <TablePagination
        component="div"
        count={notifications.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Paper>
  );
};

export default NotificationPage;
