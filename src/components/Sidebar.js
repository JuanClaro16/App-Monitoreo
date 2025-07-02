import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHome, FaBell, FaClipboardList, FaHistory,
  FaChartPie, FaSignOutAlt, FaCog, FaUserCircle, FaFlask
} from "react-icons/fa";

import { getAuth, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebase";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [nombreUsuario, setNombreUsuario] = useState("");

  useEffect(() => {
    const fetchNombre = async () => {
      try {
        const auth = getAuth(app);
        const user = auth.currentUser;

        if (user) {
          const db = getFirestore(app);
          const docRef = doc(db, "usuarios", user.uid);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const datos = docSnap.data();
            setNombreUsuario(datos.nombres || "Usuario");
          } else {
            setNombreUsuario("Usuario");
          }
        }
      } catch (error) {
        console.error("Error obteniendo datos del usuario:", error);
        setNombreUsuario("Usuario");
      }
    };

    fetchNombre();
  }, []);

  const isActive = (path) => location.pathname === path;

  const cerrarSesion = async () => {
    try {
      const auth = getAuth(app);
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
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
