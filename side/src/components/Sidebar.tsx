import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Typography,
  ListItemIcon,
} from "@mui/material";
import { Home, Description } from "@mui/icons-material";
import { Link, useLocation } from "react-router-dom";

interface SidebarProps {
  isVisible: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isVisible }) => {
  const location = useLocation();

  const navItems = [
    { text: "Home", path: "/", icon: <Home /> },
    { text: "Create Form", path: "/form", icon: <Description /> },
  ];

  return (
    <Box
      sx={{
        width: 240,
        height: "100vh",
        position: "fixed",
        left: 0,
        backgroundColor: "#1e1e2f",
        color: "#fff",
        transform: isVisible ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.3s ease-in-out",
        zIndex: 1200,
        boxShadow: 3,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Divider sx={{ borderColor: "#444" }} />
      <List sx={{ mt: 8 }}>
        {navItems.map((item) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton
              component={Link}
              to={item.path}
              selected={location.pathname === item.path}
              sx={{
                color: "#fff",
                px: 3,
                py: 1.5,
                "&.Mui-selected": {
                  backgroundColor: "#394264",
                  "&:hover": {
                    backgroundColor: "#3f4a70",
                  },
                },
                "&:hover": {
                  backgroundColor: "#2e2e42",
                },
              }}
            >
              <ListItemIcon sx={{ color: "#aaa" }}>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontSize: "1rem",
                  fontWeight: 500,
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default Sidebar;
