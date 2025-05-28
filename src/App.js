import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Authentication from './Components/Authentication';
import AdminDashboard from './Components/AdminDashboard';
import PlayerDashboard from './Components/PlayerDashboard';
import RefereeDashboard from './Components/RefereeDashboard';
import Logout from './Components/Logout';

function App() {
  const role = localStorage.getItem('role');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Authentication />} />

        {/* Role-based access */}
        <Route path="/admin" element={role === 'admin' ? <AdminDashboard /> : <Navigate to="/" />} />
        <Route path="/player" element={role === 'player' ? <PlayerDashboard /> : <Navigate to="/" />} />
        <Route path="/referee" element={role === 'referee' ? <RefereeDashboard /> : <Navigate to="/" />} />

        <Route path="/logout" element={<Logout />} />
      </Routes>
    </Router>
  );
}

export default App;
