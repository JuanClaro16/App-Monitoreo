import React, { useState, useEffect } from "react";
import { Card, Button, Nav } from "react-bootstrap";
import GraficaConsumo from "../components/GraficaConsumo";
import MiniGraficaHistorial from "../components/MiniGraficaHistorial";
import { FaChartLine, FaHistory, FaLightbulb } from "react-icons/fa";
import { FaPlug, FaSnowflake, FaClock, FaWind, FaSun, FaTshirt, FaSnowman, FaExclamationTriangle, FaBatteryHalf } from "react-icons/fa"; // Importar todos los íconos necesarios
import { Link } from "react-router-dom";

// Recomendaciones completas
const recomendaciones = [
  {
    texto: "Sustituye bombillas tradicionales por LEDs para reducir el consumo hasta un 80%",
    icono: <FaLightbulb />
  },
  {
    texto: "Desconecta los aparatos electrónicos en lugar de dejarlos en standby",
    icono: <FaPlug />
  },
  {
    texto: "Optimiza el uso del aire acondicionado ajustando la temperatura a 24°C",
    icono: <FaSnowflake />
  },
  {
    texto: "Utiliza electrodomésticos en horas de menor demanda para aprovechar tarifas reducidas",
    icono: <FaClock />
  },
  {
    texto: "Mantén los filtros de aire acondicionado limpios para mejorar su eficiencia",
    icono: <FaWind />
  },
  {
    texto: "Aprovecha la luz natural siempre que sea posible",
    icono: <FaSun />
  },
  {
    texto: "Lava ropa con carga completa para optimizar el consumo de la lavadora",
    icono: <FaTshirt />
  },
  {
    texto: "Evita abrir el refrigerador innecesariamente para ahorrar energía",
    icono: <FaSnowman />
  },
  { 
    texto: "Revisa fugas eléctricas o mal estado en cables para evitar pérdidas",
    icono: <FaExclamationTriangle />
  },
  {
    texto: "Configura el modo ahorro en tus dispositivos electrónicos",
    icono: <FaBatteryHalf />
  }
];

const RealTimeConsumption = () => {
  const [vistaActiva, setVistaActiva] = useState("tiempo-real");
  const [recomendacion, setRecomendacion] = useState("");

  useEffect(() => {
    if (vistaActiva === "recomendaciones") {
      // Obtener fecha actual como YYYYMMDD
      const hoy = new Date();
      const fechaClave = hoy.getFullYear().toString() + (hoy.getMonth() + 1).toString().padStart(2, '0') + hoy.getDate().toString().padStart(2, '0');

      // Convertir fecha en un número y usar módulo para seleccionar
      const indice = parseInt(fechaClave) % recomendaciones.length;
      setRecomendacion(recomendaciones[indice]);
    }
  }, [vistaActiva]);

  const renderContenido = () => {
    if (vistaActiva === "tiempo-real") {
      return (
        <Card className="mb-4 shadow rounded-4">
          <Card.Body>
            <h5 className="mb-2">Consumo en Tiempo Real</h5>
            <p className="text-muted">Datos actualizados cada 5 segundos desde el sensor.</p>
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
        <Card className="mb-4 shadow-sm bg-light rounded">
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <div className="d-flex align-items-center">
                <FaLightbulb className="text-warning me-2" size={20} />
                <h5 className="mb-0 fw-semibold">Recomendación del Día</h5>
              </div>
              <Button variant="outline-primary" size="sm" href="/recommendations">
                Ver más
              </Button>
            </div>
            <p className="mb-0 text-dark">
              {recomendacion.icono} {recomendacion.texto}
            </p>
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
