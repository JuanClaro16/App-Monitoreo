import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import RealTimeConsumption from './pages/RealTimeConsumption';
import History from './pages/History';
import Recommendations from './pages/Recommendations';
import Alerts from './pages/Alerts';
import Login from './pages/Login';
import Registro from './pages/Registro';
import Sidebar from './components/Sidebar';
import MiConsumo from './pages/MiConsumo';
import Configuracion from './pages/Configuracion';
import Simulacion from "./pages/Simulacion";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { getAuth, onAuthStateChanged } from 'firebase/auth';

function AppWrapper() {
  return (
    <Router>
      <App />
    </Router>
  );
}

function App() {
  const [usuarioActual, setUsuarioActual] = useState(undefined);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuarioActual(user);
    });
    return () => unsubscribe();
  }, []);

  if (usuarioActual === undefined) {
    return null; // Mientras se valida el usuario
  }

  return (
    <>
      <Routes>
        {/* Públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />

        {/* Privadas */}
        {usuarioActual ? (
          <>
            <Route path="/" element={<PrivateRoute><RealTimeConsumption /></PrivateRoute>} />
            <Route path="/alerts" element={<PrivateRoute><Alerts /></PrivateRoute>} />
            <Route path="/recommendations" element={<PrivateRoute><Recommendations /></PrivateRoute>} />
            <Route path="/history" element={<PrivateRoute><History /></PrivateRoute>} />
            <Route path="/consumo" element={<PrivateRoute><MiConsumo /></PrivateRoute>} />
            <Route path="/ajustes" element={<PrivateRoute><Configuracion /></PrivateRoute>} />
            <Route path="/simulacion" element={<Simulacion />} />
          </>
        ) : (
          <Route path="*" element={<Navigate to="/login" />} />
        )}
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

// Componente para envolver las rutas privadas (agrega Sidebar)
function PrivateRoute({ children }) {
  return (
    <div className="d-flex">
      <Sidebar />
      <div className="flex-grow-1 p-3">
        {children}
      </div>
    </div>
  );
}

export default AppWrapper;
