import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "../pages/landing";
import Authentication from "../pages/authentication";
import { AuthProvider } from "../context/AuthContext";
import VideoMeetComponent from "../pages/VideoMeet";
import HomeComponent from "../pages/home";
import History from "../pages/history";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/auth" element={<Authentication />} />
          <Route path="/home" element={<HomeComponent />} />
          <Route path="/history" element={<History />} />
          <Route path="/:url" element={<VideoMeetComponent />} />
        </Routes>
      </AuthProvider>
      
    </Router>
  );
}

export default App;
