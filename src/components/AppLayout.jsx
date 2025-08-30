// AppLayout.js
import React, { useState } from "react";
import { Outlet, NavLink } from "react-router-dom";
import {
  Box,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import MapIcon from "@mui/icons-material/Map";
import HistoryIcon from "@mui/icons-material/History";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AssessmentIcon from "@mui/icons-material/Assessment";
import InsightsIcon from "@mui/icons-material/Insights";
import AccountCircleIcon from "@mui/icons-material/AccountCircle"; // Admin icon

const drawerWidth = 240;

const navItems = [
  { path: "/", label: "Map View", icon: <MapIcon /> },
  { path: "/history", label: "History", icon: <HistoryIcon /> },
  { path: "/notification", label: "Notification", icon: <NotificationsIcon /> },
  { path: "/ai-suggestion", label: "AI Suggestion", icon: <SmartToyIcon /> },
  { path: "/guidelines", label: "Guidelines", icon: <MenuBookIcon /> },
  { path: "/report", label: "Report", icon: <AssessmentIcon /> },
  { path: "/stats-board", label: "Stats Board", icon: <InsightsIcon /> },
];

export default function AppLayout() {
  const [open, setOpen] = useState(false);

  const toggleDrawer = () => setOpen(!open);

  const drawer = (
    <Box
      sx={{
        width: drawerWidth,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between", // push admin to bottom
        bgcolor: "#1e293b",
        color: "white",
      }}
    >
      {/* Top: Nav items */}
      <Box>
        <Typography
          variant="h5"
          sx={{ p: 2, textAlign: "center", fontWeight: "bold" }}
        >
          ALERT BUDDY
        </Typography>
        <List>
          {navItems.map(({ path, label, icon }) => (
            <NavLink
              key={path}
              to={path}
              style={{ textDecoration: "none" }}
              onClick={() => setOpen(false)}
            >
              {({ isActive }) => (
                <ListItemButton
                  sx={{
                    bgcolor: isActive ? "#1e40af" : "transparent",
                    borderRadius: 2,
                    "&:hover": { bgcolor: "#334155" },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? "#0ea5e9" : "white" }}>
                    {icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={label}
                    primaryTypographyProps={{
                      color: isActive ? "#0ea5e9" : "white",
                      fontWeight: isActive ? "bold" : "normal",
                    }}
                  />
                </ListItemButton>
              )}
            </NavLink>
          ))}
        </List>
      </Box>

      {/* Bottom: Admin user */}
      <Box sx={{ p: 2, borderTop: "1px solid #334155" }}>
        <ListItemButton>
          <ListItemIcon>
            <AccountCircleIcon sx={{ color: "#0ea5e9" }} />
          </ListItemIcon>
          <ListItemText
            primary="Admin"
            primaryTypographyProps={{ color: "#0ea5e9", fontWeight: "bold" }}
          />
        </ListItemButton>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      <AppBar position="fixed" sx={{ zIndex: 1300, bgcolor: "#0f172a" }}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Left: Menu toggle & title */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton
              color="inherit"
              edge="start"
              onClick={toggleDrawer}
              aria-label="open navigation"
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap>
              Alert Buddy Dashboard
            </Typography>
          </Box>

          {/* Right: Admin icon & name */}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="subtitle1" sx={{ color: "#0ea5e9", fontWeight: "bold" }}>
              Admin
            </Typography>
            <AccountCircleIcon sx={{ mr: 1, color: "#0ea5e9" }} />
          </Box>
        </Toolbar>
      </AppBar>


      <Drawer
        open={open}
        onClose={toggleDrawer}
        variant="temporary"
        ModalProps={{ keepMounted: true }}
        sx={{
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            bgcolor: "#1e293b",
          },
        }}
      >
        {drawer}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          mt: 8,
          minHeight: "calc(100vh - 64px)",
          overflow: "auto",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
}
