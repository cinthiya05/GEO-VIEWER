import { NavLink, useLocation } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";

import MapIcon from "@mui/icons-material/Map";
import HistoryIcon from "@mui/icons-material/History";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import HelpIcon from "@mui/icons-material/Help";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MenuBookIcon from "@mui/icons-material/MenuBook"; // 📘 Guidelines
import AssessmentIcon from "@mui/icons-material/Assessment"; // 📊 Report
import InsightsIcon from "@mui/icons-material/Insights"; // 📊 Stats Board


const navItems = [
  { path: "/", label: "Map View", icon: <MapIcon /> },
  { path: "/history", label: "History", icon: <HistoryIcon /> },
  { path: "/notification", label: "Notification", icon: <NotificationsIcon /> },
  { path: "/ai-suggestion", label: "AI Suggestion", icon: <SmartToyIcon /> },
  { path: "/nearby-help", label: "Nearby Help", icon: <HelpIcon /> },
  {
    path: "/scheduled-tips",
    label: "Scheduled Safety Tips",
    icon: <AccessTimeIcon />,
  },
  { path: "/guidelines", label: "Guidelines", icon: <MenuBookIcon /> },
  { path: "/report", label: "Report", icon: <AssessmentIcon /> }, 
  { path: "/stats-board", label: "Stats Board", icon: <InsightsIcon /> },

];

const Sidebar = () => {
  const location = useLocation();

  return (
    <Box
      sx={{
        width: 250,
        height: "100vh",
        bgcolor: "#0f172a",
        color: "white",
        position: "fixed",
        p: 2,
      }}
    >
      <Typography
        variant="h5"
        sx={{ mb: 3, fontWeight: "bold", textAlign: "center" }}
      >
        ALERT BUDDY
      </Typography>
      <Card sx={{ bgcolor: "#1e293b" }}>
        <CardContent>
          <List>
            {navItems.map(({ path, label, icon }) => (
              <NavLink
                key={path}
                to={path}
                style={({ isActive }) => ({
                  textDecoration: "none",
                  color: isActive ? "#0ea5e9" : "white",
                })}
              >
                <ListItemButton selected={location.pathname === path}>
                  <ListItemIcon sx={{ color: "inherit" }}>{icon}</ListItemIcon>
                  <ListItemText primary={label} />
                </ListItemButton>
              </NavLink>
            ))}
          </List>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Sidebar;
