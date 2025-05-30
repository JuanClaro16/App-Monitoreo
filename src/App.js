import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import RealTimeConsumption from './pages/RealTimeConsumption';
import History from './pages/History';
import Recommendations from './pages/Recommendations';
import Alerts from './pages/Alerts';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Sidebar from './components/Sidebar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function App() {
  const [usuarioActual, setUsuarioActual] = useState(undefined); // 👈 importante usar undefined
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('usuarioActual'));
    setUsuarioActual(user || null);
    const loginFlag = localStorage.getItem("loginSuccess");
    if (loginFlag) {
      toast.success("Inicio de sesión exitoso");
      localStorage.removeItem("loginSuccess");
    }
  }, []);

  if (usuarioActual === undefined) {
    return null; // 👈 no renderiza nada hasta saber si hay usuario
  }

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
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;
