import React, { useEffect, useState } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../firebase";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { FaBolt } from "react-icons/fa";
import { Badge, Button, Card, Col, Container, Form, Row } from "react-bootstrap";

// Extensiones de dayjs
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);

const db = getFirestore(app);
const auth = getAuth(app);

const umbrales = {
    Nevera: { moderado: 4.2, excesivo: 5.0 }, // en Watts por minuto
    Televisor: { moderado: 110, excesivo: 150 },
    Lavadora: { moderado: 10.0, excesivo: 12.5 } // 800-1000W en 80 minutos → promedio 10-12.5 W/min
};

const Alerts = () => {
    const [alertas, setAlertas] = useState([]);
    const [dispositivoFiltro, setDispositivoFiltro] = useState("Todos");
    const [estadoFiltro, setEstadoFiltro] = useState("TODOS");
    const [dispositivos, setDispositivos] = useState([]);

    const fetchDatos = async () => {
        const user = auth.currentUser;
        if (!user) return;

        const ref = doc(db, "usuarios", user.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) return;

        const config = snap.data();
        setDispositivos(config.dispositivos || []);

        const ahora = dayjs().tz("America/Bogota");
        const hace4Horas = ahora.subtract(4, "hour");

        const nuevasAlertas = [];

        for (const disp of config.dispositivos || []) {
            const res = await fetch(`http://localhost:8080/data/device?uuid=${disp.deviceUUID}`);
            const json = await res.json();

            const datosFiltrados = json.filter(d => {
                const ts = dayjs.unix(d.timeStamp).tz("America/Bogota");
                return ts.isSameOrAfter(hace4Horas) && typeof d.values?.power === "number";
            });

            const agrupados = {};
            datosFiltrados.forEach(d => {
                const minuto = dayjs.unix(d.timeStamp).tz("America/Bogota").format("YYYY-MM-DD HH:mm");
                if (!agrupados[minuto]) agrupados[minuto] = [];
                agrupados[minuto].push(d.values.power);
            });

            Object.keys(agrupados).forEach(min => {
                const promedio = agrupados[min].reduce((a, b) => a + b, 0) / agrupados[min].length;
                const nombre = disp.nombre;
                const umbral = umbrales[nombre] || {};

                let estado = null;
                if (promedio >= umbral.excesivo) estado = "excesivo";
                else if (promedio >= umbral.moderado) estado = "moderado";

                if (estado) {
                    nuevasAlertas.push({
                        dispositivo: nombre,
                        consumo: promedio.toFixed(1),
                        fecha: min,
                        estado
                    });
                }
            });
        }

        setAlertas(nuevasAlertas);
    };

    useEffect(() => {
        fetchDatos();
    }, []);

    const limpiarFiltros = () => {
        setDispositivoFiltro("Todos");
        setEstadoFiltro("TODOS");
    };

    const colorPorEstado = {
        moderado: "warning",
        excesivo: "danger"
    };

    const textoPorEstado = {
        moderado: "Consumo moderado, revisar uso.",
        excesivo: "Exceso de consumo detectado."
    };

    const alertasFiltradas = alertas.filter(a => {
        const matchDispositivo = dispositivoFiltro === "Todos" || a.dispositivo === dispositivoFiltro;
        const matchEstado = estadoFiltro === "TODOS" || a.estado === estadoFiltro;
        return matchDispositivo && matchEstado;
    });

    return (
        <Container className="mt-4">
            <h4 className="mb-3 text-danger">
                <FaBolt className="me-2" /> Alertas de Consumo
            </h4>

            <Row className="mb-3">
                <Col md={4}>
                    <Form.Label>Filtrar por dispositivo:</Form.Label>
                    <Form.Select value={dispositivoFiltro} onChange={e => setDispositivoFiltro(e.target.value)}>
                        <option value="Todos">Todos</option>
                        {dispositivos.map((d, idx) => (
                            <option key={idx} value={d.nombre}>{d.nombre}</option>
                        ))}
                    </Form.Select>
                </Col>
                <Col md={4}>
                    <Form.Label>Filtrar por estado:</Form.Label>
                    <Form.Select value={estadoFiltro} onChange={e => setEstadoFiltro(e.target.value)}>
                        <option value="TODOS">TODOS</option>
                        <option value="moderado">MODERADO</option>
                        <option value="excesivo">EXCESIVO</option>
                    </Form.Select>
                </Col>
                <Col md={4} className="d-flex align-items-end">
                    <Button variant="secondary" onClick={limpiarFiltros}>Limpiar filtros</Button>
                </Col>
            </Row>

            {alertasFiltradas.map((a, idx) => (
                <Card key={idx} className="mb-3 border border-2 border-success">
                    <Card.Body>
                        <Card.Title>
                            <FaBolt className="text-success me-2" />
                            {a.dispositivo} – {a.consumo} W
                        </Card.Title>
                        <Card.Subtitle className="mb-2 text-muted">{a.fecha}</Card.Subtitle>
                        <Card.Text>{textoPorEstado[a.estado]}</Card.Text>
                        <Badge bg={colorPorEstado[a.estado]} className="float-end text-uppercase">{a.estado}</Badge>
                    </Card.Body>
                </Card>
            ))}
        </Container>
    );
};

export default Alerts;
