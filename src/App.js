import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RealTimeConsumption from './pages/RealTimeConsumption';
import History from './pages/History';
import Recommendations from './pages/Recommendations';
import Alerts from './pages/Alerts';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Sidebar from './components/Sidebar';

function App() {
  const[usuarioActual, setUsuarioActual] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("usuarioActual"));
    setUsuarioActual(user);
  }, []);

  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* Rutas privadas */}
        {usuarioActual ? (
          <>
            <Route path="/" element={
              <div className="d-flex">
                <Sidebar />
                <div className="flex-grow-1 p-3">
                  <RealTimeConsumption />
                </div>
              </div>
            } />
            <Route path="/alerts" element={
              <div className="d-flex">
                <Sidebar />
                <div className="flex-grow-1 p-3">
                  <Alerts />
                </div>
              </div>
            } />
            <Route path="/recommendations" element={
              <div className="d-flex">
                <Sidebar />
                <div className="flex-grow-1 p-3">
                  <Recommendations />
                </div>
              </div>
            } />
            <Route path="/history" element={
              <div className="d-flex">
                <Sidebar />
                <div className="flex-grow-1 p-3">
                  <History />
                </div>
              </div>
            } />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
