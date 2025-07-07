import React, { useEffect, useState } from "react";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../firebase";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { Form } from "react-bootstrap";

dayjs.extend(utc);
dayjs.extend(timezone);

const db = getFirestore(app);
const auth = getAuth(app);
const colores = ["#007bff", "#28a745", "#ffc107", "#dc3545", "#17a2b8", "#6610f2"];

const History = () => {
  const [datos, setDatos] = useState([]);
  const [dispositivos, setDispositivos] = useState([]);
  const [dispositivoSeleccionado, setDispositivoSeleccionado] = useState("Todos");
  const [fechaSeleccionada, setFechaSeleccionada] = useState(dayjs().format("YYYY-MM-DD"));
  const [filtrarUltimas4h, setFiltrarUltimas4h] = useState(false);

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

        const filtrados = json.filter(d => d.values?.power !== undefined && d.timeStamp).map(d => ({
          deviceUUID: d.deviceUUID,
          timeStamp: d.timeStamp,
          power: d.values.power
        }));

        datosTotales.push(...filtrados);
      }

      setDatos(datosTotales);
    };

    obtenerDatos();
    const intervalo = setInterval(obtenerDatos, 10000);
    return () => clearInterval(intervalo);
  }, []);

  const filtrarUltimas4HorasPorDispositivo = (data) => {
    const agrupado = {};
    data.forEach(d => {
      if (!agrupado[d.deviceUUID]) agrupado[d.deviceUUID] = [];
      agrupado[d.deviceUUID].push(d);
    });

    const resultado = [];
    for (const [uuid, lista] of Object.entries(agrupado)) {
      const ordenados = lista.sort((a, b) => a.timeStamp - b.timeStamp);
      const ultimaHora = ordenados[ordenados.length - 1]?.timeStamp || 0;
      const desde = ultimaHora - 4 * 3600;
      resultado.push(...ordenados.filter(d => d.timeStamp >= desde));
    }
    return resultado;
  };

  const datosFiltrados = dispositivoSeleccionado === "Todos"
    ? datos
    : datos.filter(d => d.deviceUUID === dispositivoSeleccionado);

  const datosPorFecha = datosFiltrados.filter(d => {
    const fechaDato = dayjs.unix(d.timeStamp).utcOffset(0);
    const fechaSeleccion = dayjs(fechaSeleccionada).startOf("day");
    return fechaDato.isSame(fechaSeleccion, "day");
  });

  const datosFinales = filtrarUltimas4h ? filtrarUltimas4HorasPorDispositivo(datosPorFecha) : datosPorFecha;

  const agrupados = {};
  datosFinales.forEach(d => {
    const minuto = dayjs.unix(d.timeStamp).utcOffset(0).format("HH:mm");
    if (!agrupados[minuto]) agrupados[minuto] = {};
    if (!agrupados[minuto][d.deviceUUID]) agrupados[minuto][d.deviceUUID] = [];
    agrupados[minuto][d.deviceUUID].push(d.power);
  });

  const UMBRAL_MAXIMO_W = 1000;
  const labels = Object.keys(agrupados).sort();

  const dispositivosFiltrados = dispositivoSeleccionado === "Todos"
    ? dispositivos
    : dispositivos.filter(d => d.deviceUUID === dispositivoSeleccionado);

  const datasets = dispositivosFiltrados.map((disp, i) => {
    const data = labels.map(label => {
      const valores = agrupados[label]?.[disp.deviceUUID] || [];
      const valoresValidos = valores.filter(p => p >= 0 && p < UMBRAL_MAXIMO_W);
      if (valoresValidos.length === 0) return 0;
      const promedio = valoresValidos.reduce((a, b) => a + b, 0) / valoresValidos.length;
      return parseFloat((promedio / 60).toFixed(2)); // Wh por minuto
    });
    const colorIndex = dispositivos.findIndex(d => d.deviceUUID === disp.deviceUUID);
    return {
      label: disp.nombre,
      data,
      backgroundColor: colores[colorIndex % colores.length]
    };
  });

  const data = { labels, datasets };
  const totalWh = datasets.reduce((acum, ds) => acum + ds.data.reduce((a, b) => a + b, 0), 0);
  const totalKWh = parseFloat((totalWh / 1000).toFixed(4));
  const allValues = datasets.flatMap(ds => ds.data);
  const max = Math.max(...allValues);
  const min = Math.min(...allValues);
  const avg = parseFloat((totalWh / allValues.length).toFixed(2));
  const horaMax = labels[allValues.indexOf(max)] || "-";
  const horaMin = labels[allValues.indexOf(min)] || "-";

  // Guardar simulación medida en Firebase
  useEffect(() => {
    const guardarSimulacionMedida = async () => {
      const user = auth.currentUser;
      if (!filtrarUltimas4h || !user) return;

      const simulacionPorDispositivo = {};
      dispositivosFiltrados.forEach((disp, i) => {
        const energiaWh = datasets[i].data.reduce((a, b) => a + b, 0);
        simulacionPorDispositivo[disp.deviceUUID] = {
          nombre: disp.nombre,
          energiaWh: parseFloat(energiaWh.toFixed(2)),
          energiaKWh: parseFloat((energiaWh / 1000).toFixed(4)),
        };
      });

      const ref = doc(db, "usuarios", user.uid);
      await setDoc(ref, { simulacionMedida: simulacionPorDispositivo }, { merge: true });
    };

    guardarSimulacionMedida();
  }, [filtrarUltimas4h, datasets, dispositivosFiltrados]);

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
        <div className="col-md-4 d-flex align-items-end">
          <Form.Check
            type="switch"
            id="filtro-ultimas-4h"
            label="Mostrar solo las últimas 4 horas medidas"
            checked={filtrarUltimas4h}
            onChange={(e) => setFiltrarUltimas4h(e.target.checked)}
          />
        </div>
      </div>

      <Bar
        data={data}
        options={{
          scales: {
            y: {
              title: {
                display: true,
                text: 'Energía (Wh)'
              }
            }
          },
          plugins: {
            legend: {
              labels: {
                generateLabels: (chart) => {
                  const original = chart.data.datasets;
                  return original.map((ds, i) => ({
                    text: `${ds.label} – Wh`,
                    fillStyle: ds.backgroundColor,
                    strokeStyle: ds.backgroundColor,
                    index: i
                  }));
                }
              }
            }
          }
        }}
      />

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
