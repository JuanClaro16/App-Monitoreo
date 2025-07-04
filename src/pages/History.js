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
  const [fechaSeleccionada, setFechaSeleccionada] = useState(dayjs().format("YYYY-MM-DD"));

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

        const filtrados = json.filter(d => d.values?.power !== undefined && d.values?.power !== null && d.timeStamp).map(d => ({
          deviceUUID: d.deviceUUID,
          timeStamp: d.timeStamp,
          power: d.values.power
        }));

        datosTotales.push(...filtrados);
      }

      setDatos(datosTotales);
    };

    obtenerDatos();
    const intervalo = setInterval(obtenerDatos, 10000); // cada 10 segundos
    return () => clearInterval(intervalo);
  }, []);

  // Filtrar por dispositivo
  const datosFiltrados = dispositivoSeleccionado === "Todos"
    ? datos
    : datos.filter(d => d.deviceUUID === dispositivoSeleccionado);

  // Filtrar por fecha
  const datosPorFecha = datosFiltrados.filter(d => {
    const fechaDato = dayjs.unix(d.timeStamp).utcOffset(0);
    const fechaSeleccion = dayjs(fechaSeleccionada).startOf("day");
    return fechaDato.isSame(fechaSeleccion, "day");
  });

  // Agrupar por minuto y calcular energía en Wh
  const agrupados = {};
  const conteo = {};

  datosPorFecha.forEach(d => {
    const minuto = dayjs.unix(d.timeStamp).utcOffset(0).format("HH:mm");
    if (!agrupados[minuto]) {
      agrupados[minuto] = [];
    }
    agrupados[minuto].push(d.power);
  });

  const UMBRAL_MAXIMO_W = 300; // umbral para ignorar valores anómalos
  const labels = Object.keys(agrupados);
  const consumos = labels.map(label => {
    const valoresValidos = agrupados[label].filter(p => p >= 0 && p < UMBRAL_MAXIMO_W);
    if (valoresValidos.length === 0) return 0;
    const promedio = valoresValidos.reduce((a, b) => a + b, 0) / valoresValidos.length;
    return parseFloat((promedio / 60).toFixed(2));
  });

  // Estadísticas de resumen
  const totalWh = consumos.reduce((a, b) => a + b, 0);
  const totalKWh = parseFloat((totalWh / 1000).toFixed(4));
  const max = Math.max(...consumos);
  const min = Math.min(...consumos);
  const avg = parseFloat((totalWh / consumos.length).toFixed(2));
  const horaMax = labels[consumos.indexOf(max)] || "-";
  const horaMin = labels[consumos.indexOf(min)] || "-";

  const data = {
    labels,
    datasets: [
      {
        label: "Energía (Wh)",
        data: consumos,
        backgroundColor: "#007bff"
      }
    ]
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4><i className="bi bi-bar-chart" /> Historial de Consumo</h4>
        <small className="text-muted">Actualización automática cada 10 s</small>
      </div>

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
      </div>

      <Bar data={data} />

      <div className="mt-5 p-3 bg-light rounded border">
        <h5>Resumen de Consumo</h5>
        <table className="table table-bordered">
          <tbody>
            <tr>
              <th>Total de energía consumida:</th>
              <td>{totalWh.toFixed(2)} Wh</td>
            </tr>
            <tr>
              <th>Equivalente en kWh:</th>
              <td>{totalKWh} kWh</td>
            </tr>
            <tr>
              <th>Dispositivo:</th>
              <td>
                {dispositivoSeleccionado === "Todos"
                  ? "Todos"
                  : (dispositivos.find(d => d.deviceUUID === dispositivoSeleccionado)?.nombre || dispositivoSeleccionado)}
              </td>
            </tr>
          </tbody>
        </table>

        <h6>Análisis de Tendencias</h6>
        <ul>
          <li>🔼 Mayor consumo: {horaMax} – {max} Wh</li>
          <li>🔽 Menor consumo: {horaMin} – {min} Wh</li>
          <li>📊 Promedio: {avg} Wh/min</li>
        </ul>
      </div>
    </div>
  );
};

export default History;
