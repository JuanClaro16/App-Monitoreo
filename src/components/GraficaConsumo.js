import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const datosSimulados = [
  { hora: "01:00", consumo: 1.5 },
  { hora: "03:00", consumo: 1.2 },
  { hora: "05:00", consumo: 2.0 },
  { hora: "07:00", consumo: 3.2 },
  { hora: "09:00", consumo: 4.1 },
  { hora: "11:00", consumo: 4.5 },
];

const GraficaConsumo = () => {
    // En el futuro, reemplaza "datosSimulados" por el dato que venga del sensor.
  return (
    <div style={{ width: "100%", height: 300 }}>
      <h5 className="mb-4">Consumo en Tiempo Real</h5>
      <ResponsiveContainer>
        <LineChart data={datosSimulados}>
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
            name="Consumo (kW)"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficaConsumo;
