import React, { useState, useEffect } from "react";
import { Card, Badge, Form } from "react-bootstrap";
import { FaBolt, FaExclamationTriangle, FaBroom } from "react-icons/fa";

// Lista de electrodomésticos simulados
const electrodomesticos = [
  "Todos",
  "Refrigerador",
  "Lavadora",
  "Aire Acondicionado",
  "Televisor",
  "Computadora",
  "Microondas"
];

const estadosDisponibles = ["Todos", "bueno", "moderado", "excesivo"];

// Función que genera alertas simuladas
const generarAlertasSimuladas = () => {
  const estados = [];

  for (let i = 0; i < 20; i++) {
    const dispositivo = electrodomesticos[Math.floor(Math.random() * (electrodomesticos.length - 1)) + 1];
    const consumo = Math.floor(Math.random() * 120);
    const fecha = new Date(Date.now() - Math.random() * 86400000 * 7); // Últimos 7 días

    let estado = "bueno";
    if (consumo >= 80) estado = "excesivo";
    else if (consumo >= 50) estado = "moderado";

    estados.push({
      dispositivo,
      consumo,
      fecha: fecha.toLocaleString(),
      estado
    });
  }

  return estados;
};

// Mapeos de estado a estilos y texto
const colorPorEstado = {
  bueno: "success",
  moderado: "warning",
  excesivo: "danger"
};

const textoPorEstado = {
  bueno: "Consumo dentro del rango ideal.",
  moderado: "Consumo moderado, revisar uso.",
  excesivo: "Exceso de consumo detectado."
};

const Alerts = () => {
  const [alertasTotales, setAlertasTotales] = useState([]);
  const [alertasFiltradas, setAlertasFiltradas] = useState([]);

  const [filtroDispositivo, setFiltroDispositivo] = useState("Todos");
  const [filtroEstado, setFiltroEstado] = useState("Todos");

  // Generar alertas al cargar
  useEffect(() => {
    const simuladas = generarAlertasSimuladas();
    setAlertasTotales(simuladas);
  }, []);

  // Aplicar filtros cada vez que cambien
  useEffect(() => {
    const filtradas = alertasTotales.filter((a) => {
      const coincideDispositivo = filtroDispositivo === "Todos" || a.dispositivo === filtroDispositivo;
      const coincideEstado = filtroEstado === "Todos" || a.estado === filtroEstado;
      return coincideDispositivo && coincideEstado;
    });

    setAlertasFiltradas(filtradas);
  }, [alertasTotales, filtroDispositivo, filtroEstado]);

  return (
    <div className="p-4">
      <h4 className="mb-3">
        <FaExclamationTriangle className="me-2 text-danger" />
        Alertas de Consumo
      </h4>

      {/* Filtros */}
      <div className="row mb-2">
        <div className="col-md-6 mb-2">
          <Form.Label>Filtrar por dispositivo:</Form.Label>
          <Form.Select
            value={filtroDispositivo}
            onChange={(e) => setFiltroDispositivo(e.target.value)}
          >
            {electrodomesticos.map((d, i) => (
              <option key={i} value={d}>
                {d}
              </option>
            ))}
          </Form.Select>
        </div>
        <div className="col-md-6 mb-2">
          <Form.Label>Filtrar por estado:</Form.Label>
          <Form.Select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
          >
            {estadosDisponibles.map((e, i) => (
              <option key={i} value={e}>
                {e.toUpperCase()}
              </option>
            ))}
          </Form.Select>
        </div>
      </div>

      {/* Botón de limpiar filtros */}
      <div className="d-flex justify-content-end mb-4">
        <button
          className="btn btn-outline-secondary btn-sm d-flex align-items-center"
          onClick={() => {
            setFiltroDispositivo("Todos");
            setFiltroEstado("Todos");
            const nuevas = generarAlertasSimuladas();
            setAlertasTotales(nuevas);
          }}
        >
          <FaBroom className="me-2" />
          Limpiar filtros
        </button>
      </div>

      {/* Lista de alertas */}
      {alertasFiltradas.length === 0 ? (
        <p className="text-muted">No hay alertas que coincidan con los filtros.</p>
      ) : (
        alertasFiltradas.map((alerta, idx) => (
          <Card
            key={idx}
            className={`mb-3 shadow-sm border-${colorPorEstado[alerta.estado]} rounded-4`}
          >
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-1">
                    <FaBolt className={`me-2 text-${colorPorEstado[alerta.estado]}`} />
                    {alerta.dispositivo} – {alerta.consumo.toFixed(1)} kWh
                  </h5>
                  <small className="text-muted">{alerta.fecha}</small>
                  <p className="mt-2 mb-0">{textoPorEstado[alerta.estado]}</p>
                </div>
                <Badge bg={colorPorEstado[alerta.estado]} pill>
                  {alerta.estado.toUpperCase()}
                </Badge>
              </div>
            </Card.Body>
          </Card>
        ))
      )}
    </div>
  );
};

export default Alerts;
