import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaBell, FaClipboardList, FaHistory } from "react-icons/fa"; // Importamos iconos

function Sidebar() {
  return (
    <div className="sidebar d-flex flex-column p-3 shadow-sm vh-100">
      {/* Título y logo */}
      <h2 className="text-center fw-bold mb-4">⚡ Energy Monitor</h2>

      {/* Opciones del menú */}
      <ul className="nav flex-column">
        <li className="nav-item">
          <Link className="nav-link  d-flex align-items-center" to="/">
            <FaHome className="me-2" /> Inicio
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link  d-flex align-items-center" to="/alerts">
            <FaBell className="me-2" /> Alertas
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link  d-flex align-items-center" to="/recommendations">
            <FaClipboardList className="me-2" /> Recomendaciones
          </Link>
        </li>
        <li className="nav-item">
          <Link className="nav-link  d-flex align-items-center" to="/history">
            <FaHistory className="me-2" /> Historial
          </Link>
        </li>
      </ul>

      {/* Espacio al final */}
      <div className="mt-auto text-center">
        <small className="text-muted">Versión 1.0</small>
      </div>
    </div>
  );
}

export default Sidebar;
