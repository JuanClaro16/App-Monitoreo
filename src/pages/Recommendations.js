import React from "react";
import { Card } from "react-bootstrap";
import * as Icons from "react-icons/fa";

const recomendaciones = [
  {
    texto: "Sustituye bombillas tradicionales por LEDs para reducir el consumo hasta un 80%",
    icono: <Icons.FaLightbulb />
  },
  {
    texto: "Desconecta los aparatos electrónicos en lugar de dejarlos en standby",
    icono: <Icons.FaPlug />
  },
  {
    texto: "Optimiza el uso del aire acondicionado ajustando la temperatura a 24°C",
    icono: <Icons.FaSnowflake />
  },
  {
    texto: "Utiliza electrodomésticos en horas de menor demanda para aprovechar tarifas reducidas",
    icono: <Icons.FaClock />
  },
  {
    texto: "Mantén los filtros de aire acondicionado limpios para mejorar su eficiencia",
    icono: <Icons.FaWind />
  },
  {
    texto: "Aprovecha la luz natural siempre que sea posible",
    icono: <Icons.FaSun />
  },
  {
    texto: "Lava ropa con carga completa para optimizar el consumo de la lavadora",
    icono: <Icons.FaTshirt />
  },
  {
    texto: "Evita abrir el refrigerador innecesariamente para ahorrar energía",
    icono: <Icons.FaSnowman />
  },
  {
    texto: "Revisa fugas eléctricas o mal estado en cables para evitar pérdidas",
    icono: <Icons.FaExclamationTriangle />
  },
  {
    texto: "Configura el modo ahorro en tus dispositivos electrónicos",
    icono: <Icons.FaBatteryHalf />
  }
];

const Recommendations = () => {
  // Generar recomendaciones diarias (pseudoaleatorias pero fijas por día)
  const hoy = new Date();
  const seed = parseInt(
    hoy.getFullYear().toString() +
    (hoy.getMonth() + 1).toString().padStart(2, "0") +
    hoy.getDate().toString().padStart(2, "0")
  );

  const recomendacionesDelDia = [];
  const copia = [...recomendaciones];
  for (let i = 0; i < 5 && copia.length > 0; i++) {
    const index = seed % copia.length;
    recomendacionesDelDia.push(copia[index]);
    copia.splice(index, 1);
  }

  return (
    <div className="p-4">
      <h4 className="mb-4">
        <Icons.FaLightbulb className="me-2 text-warning" />
        Recomendaciones de Ahorro
      </h4>

      {recomendacionesDelDia.map((rec, idx) => (
        <Card key={idx} className="mb-3 shadow-sm">
          <Card.Body className="d-flex align-items-start">
            <span className="text-warning me-3 mt-1">{rec.icono}</span>
            <span>{rec.texto}</span>
          </Card.Body>
        </Card>
      ))}

      <p className="text-muted mt-3">
        <Icons.FaInfoCircle className="me-2" />
        Estas recomendaciones se actualizan automáticamente cada día.
      </p>
    </div>
  );
};

export default Recommendations;
