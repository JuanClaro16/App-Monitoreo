import React, { useState } from "react";
import { Bar } from "react-chartjs-2";
import { Card, Form, Row, Col } from "react-bootstrap";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { FaChartBar, FaCommentDots } from "react-icons/fa";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";


ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

// Datos simulados por electrodoméstico y año
const datosSimulados = {
  "2025": {
    Televisor: [120, 90, 100, 80, 105, 95, 85, 110, 90, 75, 130, 100],
    Refrigerador: [310, 320, 300, 305, 330, 315, 295, 310, 298, 290, 305, 300],
    Lavadora: [50, 45, 60, 55, 65, 58, 48, 62, 50, 53, 61, 59],
  },
  "2024": {
    Televisor: [100, 85, 95, 70, 90, 88, 82, 100, 88, 73, 115, 98],
    Refrigerador: [300, 310, 295, 298, 325, 310, 285, 295, 280, 270, 290, 288],
    Lavadora: [45, 43, 50, 48, 55, 53, 47, 56, 44, 49, 55, 52],
  },
};

const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function calcularTendencia(valores) {
  const trimestres = [
    valores.slice(0, 3),
    valores.slice(3, 6),
    valores.slice(6, 9),
    valores.slice(9, 12),
  ];

  const promedios = trimestres.map(
    (t) => t.reduce((a, b) => a + b, 0) / t.length
  );

  const tendencias = [];

  for (let i = 1; i < promedios.length; i++) {
    const diff = promedios[i] - promedios[i - 1];
    const porcentaje = ((diff / promedios[i - 1]) * 100).toFixed(1);
    if (diff > 0) {
      tendencias.push(`Del T${i} al T${i + 1} el consumo aumentó ${porcentaje}%.`);
    } else {
      tendencias.push(`Del T${i} al T${i + 1} el consumo disminuyó ${Math.abs(porcentaje)}%.`);
    }
  }

  return tendencias;
}

function History() {
  const [electrodomestico, setElectrodomestico] = useState("Todos");
  const [anio, setAnio] = useState("2025");

  const dataAnual = datosSimulados[anio];
  const dispositivos = Object.keys(dataAnual);

  // Datos según filtro
  let valores = [];

  if (electrodomestico === "Todos") {
    for (let i = 0; i < 12; i++) {
      const sumaMes = dispositivos.reduce(
        (acc, d) => acc + dataAnual[d][i],
        0
      );
      valores.push(sumaMes);
    }
  } else {
    valores = dataAnual[electrodomestico];
  }

  const datosGrafica = {
    labels: meses,
    datasets: [
      {
        label: "Consumo (kWh)",
        data: valores,
        backgroundColor: "#007bff",
      },
    ],
  };

  const opcionesGrafica = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
  };

  const promedioMensual = valores.reduce((a, b) => a + b, 0) / valores.length;
  const mesMax = valores.indexOf(Math.max(...valores));
  const mesMin = valores.indexOf(Math.min(...valores));
  const tendencia = calcularTendencia(valores);

  return (
    <>
      <Card className="mb-4 shadow-sm">
        <Card.Header className="fw-bold">
          <FaChartBar className="me-2" />
          Historial de Consumo
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Label>Selecciona un electrodoméstico:</Form.Label>
              <Form.Select
                value={electrodomestico}
                onChange={(e) => setElectrodomestico(e.target.value)}
              >
                <option>Todos</option>
                {dispositivos.map((d, i) => (
                  <option key={i}>{d}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={6}>
              <Form.Label>Selecciona un año:</Form.Label>
              <Form.Select
                value={anio}
                onChange={(e) => setAnio(e.target.value)}
              >
                {Object.keys(datosSimulados).map((a, i) => (
                  <option key={i}>{a}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          {/* Gráfica con altura controlada */}
          <div style={{ height: "360px" }}>
            <Bar data={datosGrafica} options={opcionesGrafica} />
          </div>
        </Card.Body>
      </Card>

      {/* Card Análisis */}
      <Card className="shadow-sm">
        <Card.Header className="bg-white fw-bold">
          <FaCommentDots className="me-2" />
          Análisis de Tendencias
        </Card.Header>
        {/* Análisis de tendencias */}
        <Card.Body>
          <p>
            Estás visualizando el consumo de{" "}
            <strong>
              {electrodomestico === "Todos"
                ? "todos los dispositivos"
                : electrodomestico}
            </strong>{" "}
            en el año <strong>{anio}</strong>.
          </p>

          <p>
            <strong>Promedio mensual:</strong>{" "}
            <span className="text-primary">
              {promedioMensual.toFixed(1)} kWh
            </span>
          </p>

          <p className="fw-bold mb-1">Comparación por Trimestres:</p>
          <ul className="ps-3">
            {tendencia.map((t, i) => {
              const esDisminucion = t.includes("disminuyó");
              const Icono = esDisminucion ? FaArrowDown : FaArrowUp;
              const colorClase = esDisminucion ? "text-success" : "text-danger";
              return (
                <li key={i} className={colorClase + " d-flex align-items-center gap-2"}>
                  <Icono /> <span>{t}</span>
                </li>
              );
            })}
          </ul>

          <p className="fw-bold mb-1">
            Mes de mayor consumo:{" "}
            <span className="text-dark">
              {meses[mesMax]} ({valores[mesMax]} kWh)
            </span>
          </p>
          <p className="fw-bold">
            Mes de menor consumo:{" "}
            <span className="text-dark">
              {meses[mesMin]} ({valores[mesMin]} kWh)
            </span>
          </p>
        </Card.Body>

      </Card>
    </>
  );
}

export default History;
