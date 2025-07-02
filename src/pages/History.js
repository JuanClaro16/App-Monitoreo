import React, { useEffect, useState } from "react";
import {
  getFirestore,
  doc,
  getDoc
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../firebase";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const db = getFirestore(app);
const auth = getAuth(app);

const History = () => {
  const [datos, setDatos] = useState([]);
  const [dispositivos, setDispositivos] = useState([]);
  const [dispositivoSeleccionado, setDispositivoSeleccionado] = useState("Todos");
  const [fechaSeleccionada, setFechaSeleccionada] = useState("");
  const [recargar, setRecargar] = useState(false);

  // Leer dispositivos desde Firebase
  useEffect(() => {
    const fetchDispositivos = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const ref = doc(db, "usuarios", user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        setDispositivos(snap.data().dispositivos || []);
      }
    };

    fetchDispositivos();
  }, []);

  // Obtener datos desde SmartCampus
  useEffect(() => {
    const obtenerDatos = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const ref = doc(db, "usuarios", user.uid);
      const snap = await getDoc(ref);
      const dispositivosUsuario = snap.exists() ? snap.data().dispositivos || [] : [];

      const datosTotales = [];

      for (const disp of dispositivosUsuario) {
        const res = await fetch(`http://localhost:8080/data/device?uuid=${disp.deviceUUID}`);
        const json = await res.json();

        const filtrados = json.filter(d => d.values?.power && d.timeStamp).map(d => ({
          deviceUUID: d.deviceUUID,
          timeStamp: d.timeStamp,
          power: d.values.power
        }));

        datosTotales.push(...filtrados);
      }

      setDatos(datosTotales);
    };

    obtenerDatos();
  }, [recargar]);

  // Filtrar por dispositivo
  const datosFiltrados = dispositivoSeleccionado === "Todos"
    ? datos
    : datos.filter(d => d.deviceUUID === dispositivoSeleccionado);

  // Filtrar por fecha si está seleccionada
  const datosPorFecha = datosFiltrados.filter(d => {
    if (!fechaSeleccionada) return true;
    const fechaDato = dayjs.unix(d.timeStamp).add(5, "hour").tz("America/Bogota");
    const fechaSeleccion = dayjs(fechaSeleccionada).tz("America/Bogota");
    return fechaDato.isSame(fechaSeleccion, "day");
  });

  // Agrupar por minuto (HH:mm) y sumar consumo
  const agrupados = {};
  datosPorFecha.forEach(d => {
    const minuto = dayjs.unix(d.timeStamp).add(5, "hour").tz("America/Bogota").format("HH:mm");
    if (!agrupados[minuto]) agrupados[minuto] = 0;
    agrupados[minuto] += d.power;
  });

  const labels = Object.keys(agrupados);
  const consumos = Object.values(agrupados);

  const data = {
    labels,
    datasets: [
      {
        label: "Consumo (W)",
        data: consumos,
        backgroundColor: "#007bff"
      }
    ]
  };

  return (
    <div className="container mt-4">
      <h4><i className="bi bi-bar-chart" /> Historial de Consumo</h4>

      <div className="row mb-3">
        <div className="col-md-4">
          <label>Selecciona un electrodoméstico:</label>
          <select
            className="form-select"
            value={dispositivoSeleccionado}
            onChange={e => setDispositivoSeleccionado(e.target.value)}
          >
            <option value="Todos">Todos</option>
            {dispositivos.map(d => (
              <option key={d.deviceUUID} value={d.deviceUUID}>{d.nombre}</option>
            ))}
          </select>
        </div>
        <div className="col-md-4">
          <label>Selecciona un día (opcional):</label>
          <input
            type="date"
            className="form-control"
            value={fechaSeleccionada}
            onChange={e => setFechaSeleccionada(e.target.value)}
          />
        </div>
        <div className="col-md-4 d-flex align-items-end">
          <button
            className="btn btn-primary w-100"
            onClick={() => setRecargar(prev => !prev)}
          >
            Actualizar
          </button>
        </div>
      </div>

      <Bar data={data} />
    </div>
  );
};

export default History;
