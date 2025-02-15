import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Header } from "../common/header";
import { Home } from "../home/Home";
import Trafficcontrol from "../pages/trafficcontrol";
import Dashboard from "../pages/dashboard";
import Reports from "../pages/reports";

const Pages = () => {
  return (
    <>
      <Router>
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/traffic" element={<Trafficcontrol />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </>
  );
};

export default Pages;