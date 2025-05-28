import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FaHome, FaBell, FaClipboardList, FaHistory } from "react-icons/fa";

function Sidebar() {
  const location = useLocation(); // Saber la ruta actual

  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar d-flex flex-column p-3 shadow-sm vh-100">
      <h2 className="text-center fw-bold mb-4">⚡App Monitoreo</h2>

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
        <li className="nav-item">
          <span
            className="nav-link text-danger"
            style={{ cursor: 'pointer' }}
            onClick={() => {
              localStorage.removeItem("usuarioActual");
              window.location.href = "/login"; // fuerza redirección
            }}
          >
            🔒 Cerrar sesión
          </span>
        </li>
      </ul>

      <div className="mt-auto text-center">
        <small className="text-muted">Versión 1.0</small>
      </div>
    </div>
  );
}

export default Sidebar;
