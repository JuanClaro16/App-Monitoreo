import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const GraficaConsumo = () => {
  const [datos, setDatos] = useState([]);

  const obtenerDato = async () => {
    try {
      const res = await fetch("http://localhost:8080/data/device?uuid=1");
      const json = await res.json();

      const ultimos = json.filter(d => d.values && d.values.power !== undefined);
      if (ultimos.length > 0) {
        const ultimo = ultimos[ultimos.length - 1];
        const potencia = parseFloat(ultimo.values.power.toFixed(2));
        const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const nuevoPunto = { hora, consumo: potencia };
        setDatos(prev => {
          const actualizado = [...prev, nuevoPunto];
          return actualizado.slice(-15); // Solo los últimos 15 puntos
        });
      }
    } catch (err) {
      console.error("Error obteniendo dato de consumo:", err);
    }
  };

  useEffect(() => {
    obtenerDato();
    const intervalo = setInterval(obtenerDato, 5000);
    return () => clearInterval(intervalo);
  }, []);

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={datos}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hora" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="consumo"
            stroke="#007bff"
            strokeWidth={2}
            activeDot={{ r: 6 }}
            name="Consumo (W)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficaConsumo;
