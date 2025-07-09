import React, { useEffect, useState } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../firebase";
import { Bar } from "react-chartjs-2";
import "chart.js/auto";
import { Button, Card, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const db = getFirestore(app);
const auth = getAuth(app);

const Simulacion = () => {
  const [simulacionMedida, setSimulacionMedida] = useState([]);
  const [horasTV, setHorasTV] = useState(4);
  const [lavadasSemana, setLavadasSemana] = useState(3);
  const [valorFactura, setValorFactura] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDatos = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const ref = doc(db, "usuarios", user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        const datosObj = data.simulacionMedida || {};
        const datosArray = Object.values(datosObj);
        setSimulacionMedida(datosArray);

        const configuracion = data.configuracion || {};
        setValorFactura(data.consumoMensual || 0);
        setHorasTV(configuracion.televisorHoras || 4);
        setLavadasSemana(configuracion.lavadoraVeces || 3);
      }
    };

    fetchDatos();
  }, []);

  const proyectarConsumo = (item) => {
    if (item.nombre === "Nevera") {
      return item.energiaKWh * 30 * 6;
    } else if (item.nombre === "Televisor") {
      return item.energiaKWh * (horasTV / 4) * 30;
    } else if (item.nombre === "Lavadora") {
      return item.energiaKWh * lavadasSemana * 4;
    }
    return 0;
  };

  const datosConProyeccion = simulacionMedida.map((item) => ({
    ...item,
    consumoMensual: parseFloat(proyectarConsumo(item).toFixed(2)),
  }));

  const totalSimulado = datosConProyeccion.reduce((acc, item) => acc + item.consumoMensual, 0);

  const data = {
    labels: ["Factura", "Teórico", "Simulado"],
    datasets: [
      {
        label: "Factura",
        backgroundColor: "gray",
        data: [valorFactura, null, null],
        barThickness: 100,
      },
      {
        label: "Teórico",
        backgroundColor: "blue",
        data: [null, 103, null],
        barThickness: 100,
      },
      {
        label: "Simulado",
        backgroundColor: "orange",
        data: [null, null, totalSimulado],
        barThickness: 100,
      },
    ],
  };

  return (
    <div className="container mt-4">
      <h4 className="mb-4 text-center">Resumen de Consumo Simulado</h4>

      <Row className="mb-4 justify-content-center">
        <Col md={3}>
          <Card className="text-center shadow-sm border-0">
            <Card.Body>
              <Card.Title className="fw-bold">Factura</Card.Title>
              <h5>{valorFactura} <small className="text-muted">kWh</small></h5>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow-sm border-0">
            <Card.Body>
              <Card.Title className="fw-bold">Teórico</Card.Title>
              <h5>103 <small className="text-muted">kWh</small></h5>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="text-center shadow-sm border-0 bg-warning-subtle">
            <Card.Body>
              <Card.Title className="fw-bold">Simulado Total</Card.Title>
              <h5>{totalSimulado.toFixed(2)} <small className="text-muted">kWh</small></h5>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h6 className="text-center mb-3">Comparativa gráfica:</h6>
      <Bar
        data={data}
        options={{
          plugins: {
            legend: { position: "top" },
            tooltip: {
              callbacks: {
                label: context => `${context.dataset.label}: ${context.parsed.y} kWh`
              }
            }
          },
          scales: {
            y: { beginAtZero: true, title: { display: true, text: "kWh" } }
          }
        }}
      />

      {/* Alerta comparativa */}
      <div className="mt-4 text-center">
        {totalSimulado < valorFactura && (
          <div className="alert alert-warning" role="alert">
            Tu consumo simulado mensual es menor al valor reportado en la factura. <strong>¡Podrías estar pagando de más!</strong>
          </div>
        )}
        {totalSimulado > valorFactura && (
          <div className="alert alert-danger" role="alert">
            El consumo simulado proyectado, supera el valor actual de tu factura, por lo tanto este mes <strong>estás consumiendo más energía.</strong>
          </div>
        )}
        {Math.abs(totalSimulado - valorFactura) <= 3 && (
          <div className="alert alert-success" role="alert">
            El consumo simulado está muy cercano al valor de la factura. <strong>Tu consumo estimado es consistente.</strong>
          </div>
        )}
      </div>

      {/* Tabla de detalle */}
      <div className="mt-5">
        <h5>Detalle por electrodoméstico:</h5>
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th>Electrodoméstico</th>
              <th>Consumo mensual estimado (kWh)</th>
            </tr>
          </thead>
          <tbody>
            {datosConProyeccion.map((item, idx) => (
              <tr key={idx}>
                <td>{item.nombre}</td>
                <td>{item.consumoMensual.toFixed(2)}</td>
              </tr>
            ))}
            <tr className="table-primary">
              <td><strong>Total</strong></td>
              <td><strong>{totalSimulado.toFixed(2)} kWh</strong></td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="text-center mt-4">
        <Button variant="primary" onClick={() => navigate("/consumo")}>Volver</Button>
      </div>
    </div>
  );
};

export default Simulacion;
