import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaHome, FaBell, FaClipboardList, FaHistory, FaChartPie, FaSignOutAlt, FaCog, FaUserCircle, FaFlask } from "react-icons/fa";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [nombreUsuario, setNombreUsuario] = useState("");

  useEffect(() => {
    const userData = localStorage.getItem("usuarioActual");
    if (userData) {
      try {
        const user = JSON.parse(userData);
        if (user.nombres) {
          setNombreUsuario(user.nombres);
        } else {
          setNombreUsuario("Usuario");
        }
      } catch (error) {
        console.error("Error leyendo usuarioActual:", error);
        setNombreUsuario("Usuario");
      }
    }
  }, []);

  const isActive = (path) => location.pathname === path;

  const cerrarSesion = () => {
    localStorage.removeItem("usuarioActual");
    navigate("/login");
  };

  return (
    <div className="sidebar d-flex flex-column p-3 shadow-sm vh-100" style={{ backgroundColor: "#002b5b", color: "white" }}>
      <h2 className="text-center fw-bold mb-4 text-warning">⚡App Monitoreo</h2>

      <ul className="nav flex-column">
        <li className="nav-item">
          <Link className={`nav-link d-flex align-items-center ${isActive("/") ? "active" : ""}`} to="/">
            <FaHome className="me-2" /> Inicio
          </Link>
        </li>
        <li className="nav-item">
          <Link className={`nav-link d-flex align-items-center ${isActive("/alerts") ? "active" : ""}`} to="/alerts">
            <FaBell className="me-2" /> Alertas
          </Link>
        </li>
        <li className="nav-item">
          <Link className={`nav-link d-flex align-items-center ${isActive("/recommendations") ? "active" : ""}`} to="/recommendations">
            <FaClipboardList className="me-2" /> Recomendaciones
          </Link>
        </li>
        <li className="nav-item">
          <Link className={`nav-link d-flex align-items-center ${isActive("/history") ? "active" : ""}`} to="/history">
            <FaHistory className="me-2" /> Historial
          </Link>
        </li>
        <li className="nav-item mb-3">
          <Link className={`nav-link d-flex align-items-center ${isActive("/consumo") ? "active" : ""}`} to="/consumo">
            <FaChartPie className="me-2" /> Mi Consumo
          </Link>
        </li>
        <li className="nav-item">
          <Link className={`nav-link d-flex align-items-center ${isActive("/simulador") ? "active" : ""}`} to="/simulador">
            <FaFlask className="me-2" /> Simulador
          </Link>
        </li>

      </ul>

      <div className="mt-auto d-flex flex-column align-items-center">
        <hr className="w-100 text-white" />
        <FaUserCircle size={40} className="mb-2" />
        <div className="fw-bold mb-3 text-center">Hola, {nombreUsuario}</div>

        <div className="d-grid gap-2 w-100 px-3">
          <button className="btn btn-secondary btn-sm" onClick={() => navigate("/ajustes")}>
            <FaCog className="me-2" /> Ajustes de Consumo
          </button>
          <button className="btn btn-danger btn-sm" onClick={cerrarSesion}>
            <FaSignOutAlt className="me-2" /> Cerrar Sesión
          </button>
        </div>
        <div className="text-center mt-3">
          <small className="text-light">Versión 1.0</small>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
