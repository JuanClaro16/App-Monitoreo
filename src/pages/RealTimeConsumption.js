import React, { useState, useEffect } from "react";
import { Card, Button, Nav } from "react-bootstrap";
import GraficaConsumo from "../components/GraficaConsumo";
import MiniGraficaHistorial from "../components/MiniGraficaHistorial";
import { FaChartLine, FaHistory, FaLightbulb } from "react-icons/fa";
import { Link } from "react-router-dom";

const recomendaciones = [
  "Sustituye bombillas tradicionales por LEDs para reducir el consumo hasta un 80%",
  "Desconecta los aparatos electrónicos en lugar de dejarlos en standby",
  "Optimiza el uso del aire acondicionado: cada grado por encima de 24°C ahorra un 8% de energía",
  "Utiliza electrodomésticos en horas de menor demanda para aprovechar tarifas reducidas",
  "Mantén los filtros de aire acondicionado limpios para mejorar su eficiencia",
  "Aprovecha la luz natural siempre que sea posible",
  "Apaga luces y dispositivos cuando no estén en uso",
  "Evita abrir el refrigerador innecesariamente para ahorrar energía"
];

const RealTimeConsumption = () => {
  const [vistaActiva, setVistaActiva] = useState("tiempo-real");
  const [recomendacion, setRecomendacion] = useState("");

  useEffect(() => {
    if (vistaActiva === "recomendaciones") {
      const random = Math.floor(Math.random() * recomendaciones.length);
      setRecomendacion(recomendaciones[random]);
    }
  }, [vistaActiva]);

  const renderContenido = () => {
    if (vistaActiva === "tiempo-real") {
      return (
        <Card className="mb-4 shadow rounded-4">
          <Card.Body>
            <h5 className="mb-2">Consumo en Tiempo Real</h5>
            <p className="text-muted">Datos actualizados en vivo desde el sensor.</p>
            <GraficaConsumo />
          </Card.Body>
        </Card>
      );
    }

    if (vistaActiva === "historial") {
      return (
        <Card className="mb-4 shadow rounded-4">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0"><FaHistory className="me-2" />Resumen Histórico</h5>
              <Button variant="outline-primary" size="sm" as={Link} to="/history">
                Ver historial completo
              </Button>
            </div>
            <p className="text-muted">Este mes llevas acumulado 132.4 kWh.</p>
            <MiniGraficaHistorial />
          </Card.Body>
        </Card>
      );
    }

    if (vistaActiva === "recomendaciones") {
      return (
        <Card className="mb-4 shadow rounded-4 bg-light">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="mb-0"><FaLightbulb className="me-2 text-warning" />Recomendación del Día</h5>
              <Button variant="outline-primary" size="sm" as={Link} to="/recommendations">
                Ver más
              </Button>
            </div>
            <p className="mb-0">{recomendacion}</p>
          </Card.Body>
        </Card>
      );
    }

    return null;
  };

  return (
    <div className="p-4">
      <Nav variant="tabs" activeKey={vistaActiva} onSelect={(k) => setVistaActiva(k)} className="mb-4 shadow-sm rounded">
        <Nav.Item>
          <Nav.Link eventKey="tiempo-real">
            <FaChartLine className="me-2" />
            Tiempo Real
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="historial">
            <FaHistory className="me-2" />
            Historial
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="recomendaciones">
            <FaLightbulb className="me-2" />
            Recomendaciones
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {renderContenido()}
    </div>
  );
};

export default RealTimeConsumption;
