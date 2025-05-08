import React from "react";
import { Box, Toolbar } from "@mui/material";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useSelector } from "react-redux";
import { RootState } from "../app/store";

const MainLayout: React.FC = () => {
  const isSidebarVisible = useSelector(
    (state: RootState) => state.sidebar.isVisible
  );

  return (
    <Box sx={{ display: "flex" }}>
      <Navbar />
      <Sidebar isVisible={isSidebarVisible} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          marginLeft: isSidebarVisible ? "250px" : 0,
          transition: "margin-left 0.3s ease-in-out",
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout;
