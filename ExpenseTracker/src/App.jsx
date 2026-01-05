import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import Dashboard from "./pages/Layout/Dashboard/Dashboard";
import Layout from "./pages/Layout/Layout";
import Report from "./pages/Layout/Report/Report";
import Profile from "./pages/Layout/Profile/Profile";
import Bill_Generation from "./pages/Layout/Bill_Generation/Bill_Generation";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
        
      {/* Layout wrapper */}
      <Route element={<Layout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/report" element={<Report />} />
        <Route path="/profile" element={<Profile />} />
        <Route path ="/bill/generation" element = {<Bill_Generation />} />
        {/* Add more pages here that should share the layout */}
      </Route>
    </Routes>
  );
}
