import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const datosHistoricos = [
  { mes: "Ene", consumo: 320 },
  { mes: "Feb", consumo: 310 },
  { mes: "Mar", consumo: 295 },
  { mes: "Abr", consumo: 310 },
  { mes: "May", consumo: 340 },
  { mes: "Jun", consumo: 390 },
];

const MiniGraficaHistorial = () => {
  return (
    <div style={{ width: "100%", height: 200 }}>
      <ResponsiveContainer>
        <BarChart data={datosHistoricos}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="mes" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="consumo" fill="#0d6efd" name="Consumo (kWh)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MiniGraficaHistorial;
