import React, { useState } from "react";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Typography from "@mui/material/Typography";
import { toggleSidebar } from "./sidebarSlice";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import { logout } from "../features/auth/authSlice"; 
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../app/store"; 
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import LogoutIcon from "@mui/icons-material/Logout";


const getUsername = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user).username : "Guest";
};

const Navbar: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [username] = useState(getUsername());

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  const handleLogout = async () => {
    await dispatch(logout());
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar
      position="fixed"
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backgroundColor: "#1e1e2f",
        boxShadow: 3,
      }}
    >
      <Toolbar
        sx={{
          minHeight: 60,
          display: "flex",
          justifyContent: "space-between",
          px: 2,
        }}
      >
        {/* Left section with menu toggle */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={handleToggleSidebar}
            sx={{
              mr: 2,
              "&:hover": {
                backgroundColor: "transparent",
              },
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ color: "#fff" }}
          >
            My Forms
          </Typography>
        </Box>

        {/* Right section with user menu */}
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Button
            color="inherit"
            onClick={handleMenuClick}
            sx={{
              display: "flex",
              alignItems: "center",
              "&:hover": {
                backgroundColor: "#2e2e42",
              },
            }}
          >
            <Typography variant="body1" sx={{ mr: 1 }}>
              {username}
            </Typography>
            <ArrowDropDownIcon />
          </Button>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseMenu}
            anchorOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
          >
            <MenuItem
              onClick={handleLogout}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                px: 2,
                py: 1,
                "&:hover": {
                  backgroundColor: "#f5f5f5",
                },
              }}
            >
              <LogoutIcon fontSize="small" color="action" />
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
