import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { Bar } from "react-chartjs-2";
import { app } from "../firebase";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const db = getFirestore(app);
const auth = getAuth(app);

const MiniGraficaHistorial = () => {
  const [data, setData] = useState(null);
  const [totalWh, setTotalWh] = useState(0);

  useEffect(() => {
    const obtenerDatos = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const ref = doc(db, "usuarios", user.uid);
      const snap = await getDoc(ref);
      const dispositivos = snap.exists() ? snap.data().dispositivos || [] : [];

      const datosTotales = [];
      for (const disp of dispositivos) {
        const res = await fetch(`http://localhost:8080/data/device?uuid=${disp.deviceUUID}`);
        const json = await res.json();

        const filtrados = json
          .filter(d => d.values?.power !== undefined && d.timeStamp)
          .map(d => ({
            timeStamp: d.timeStamp,
            power: d.values.power,
          }));

        datosTotales.push(...filtrados);
      }

      const agrupados = {};

      datosTotales.forEach(d => {
        const minuto = dayjs.unix(d.timeStamp).tz("America/Bogota").format("HH:mm");
        if (!agrupados[minuto]) agrupados[minuto] = [];
        agrupados[minuto].push(d.power);
      });

      const minutosOrdenados = Object.keys(agrupados).sort().slice(-60);
      const labels = minutosOrdenados;

      const consumos = labels.map(m => {
        const lista = agrupados[m];
        const suma = lista.reduce((a, b) => a + b, 0);
        return parseFloat((suma / 60).toFixed(2)); // Wh por minuto
      });

      const total = consumos.reduce((a, b) => a + b, 0).toFixed(2);

      setData({
        labels,
        datasets: [{
          label: "Consumo total (Wh)",
          data: consumos,
          backgroundColor: "#007bff",
        }]
      });

      setTotalWh(total);
    };

    obtenerDatos();
  }, []);

  if (!data || data.labels.length === 0) return <p>No hay datos recientes monitoreados.</p>;

  return (
    <div style={{ height: "260px" }}>
      <Bar
        data={data}
        options={{
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: "Energía (Wh)"
              }
            },
            x: {
              title: {
                display: true,
                text: "Hora (minutos)"
              }
            }
          },
          plugins: {
            legend: { display: false }
          },
          responsive: true,
          maintainAspectRatio: false
        }}
      />
    </div>
  );
};

export default MiniGraficaHistorial;