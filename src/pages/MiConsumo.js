import React, { useEffect, useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, LabelList
} from "recharts";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../firebase";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import { Spinner, Modal, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);

const db = getFirestore(app);
const auth = getAuth(app);

const MiConsumo = () => {
    const [config, setConfig] = useState(null);
    const [sensorData, setSensorData] = useState({ total: 0, porDispositivo: {} });
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [horasTV, setHorasTV] = useState(4);
    const [lavadasSemana, setLavadasSemana] = useState(3);
    const navigate = useNavigate();

    const fetchData = async () => {
        const user = auth.currentUser;
        if (!user) return;

        setLoading(true);
        const ref = doc(db, "usuarios", user.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) return;

        const data = snap.data();
        setConfig(data);

        const ahora = dayjs().tz("America/Bogota");
        const inicioDelMes = ahora.startOf("month");
        let totalEnergiaWh = 0;
        const consumoPorDispositivo = {};
        const UMBRAL_MAXIMO_W = 300;

        for (const disp of data.dispositivos || []) {
            const res = await fetch(`http://localhost:8080/data/device?uuid=${disp.deviceUUID}`);
            const json = await res.json();

            const datosFiltrados = json.filter(d => {
                const ts = dayjs.unix(d.timeStamp).tz("America/Bogota");
                return ts.isSameOrAfter(inicioDelMes) && typeof d.values?.power === "number";
            });

            const agrupados = {};
            datosFiltrados.forEach(d => {
                const minuto = dayjs.unix(d.timeStamp).tz("America/Bogota").format("YYYY-MM-DD HH:mm");
                if (!agrupados[minuto]) agrupados[minuto] = [];
                agrupados[minuto].push(d.values.power);
            });

            const consumos = Object.keys(agrupados).map(minuto => {
                const valoresValidos = agrupados[minuto].filter(p => p >= 0 && p < UMBRAL_MAXIMO_W);
                if (valoresValidos.length === 0) return 0;
                const promedio = valoresValidos.reduce((a, b) => a + b, 0) / valoresValidos.length;
                return promedio;
            });

            const totalWh = consumos.reduce((acc, el) => acc + (el / 60), 0);
            totalEnergiaWh += totalWh;
            consumoPorDispositivo[String(disp.deviceUUID).trim()] = parseFloat((totalWh / 1000).toFixed(4));
        }

        setSensorData({
            total: parseFloat((totalEnergiaWh / 1000).toFixed(4)),
            porDispositivo: consumoPorDispositivo
        });
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSimular = async () => {
        const user = auth.currentUser;
        if (!user) return;

        const ref = doc(db, "usuarios", user.uid);
        await updateDoc(ref, {
            configuracion: {
                televisorHoras: parseInt(horasTV),
                lavadoraVeces: parseInt(lavadasSemana)
            }
        });

        setShowModal(false);
        navigate('/simulacion');
    };

    if (!config) {
        return (
            <div className="container mt-5 text-center">
                <h3>No has configurado tus electrodomésticos</h3>
                <p>Por favor dirígete a <b>Ajustes de Consumo</b> para ingresar tu configuración antes de visualizar el resumen.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="container mt-5 text-center">
                <Spinner animation="border" role="status" />
                <p className="mt-3">Cargando datos...</p>
            </div>
        );
    }

    const { consumoMensual, dispositivos } = config;
    const consumoRealTotal = sensorData.total;

    const detalleConsumo = dispositivos.map(item => {
        const consumoTeorico = item.consumoTeorico * item.cantidad;
        const consumoReal = sensorData.porDispositivo?.[String(item.deviceUUID).trim()] || 0;
        const porcentaje = consumoMensual > 0 ? ((consumoReal / consumoMensual) * 100).toFixed(2) : "0.00";
        return {
            ...item,
            consumoTeorico,
            consumoReal: consumoReal.toFixed(2),
            porcentaje
        };
    });

    const consumoTeoricoTotal = detalleConsumo.reduce((acc, el) => acc + el.consumoTeorico, 0);

    const resumenGrafica = [
        { name: "Reportado", consumo: consumoMensual },
        { name: "Teórico", consumo: consumoTeoricoTotal },
        { name: "Medido Total", consumo: consumoRealTotal }
    ];

    return (
        <div className="container mt-4">
            <h2>Resumen de Consumo</h2>

            <div className="row text-center mb-4">
                <div className="col-md-2 offset-md-1 card p-3 shadow-sm">
                    <h6>Factura</h6>
                    <strong>{consumoMensual} kWh</strong>
                </div>
                <div className="col-md-2 card p-3 shadow-sm">
                    <h6>Teórico</h6>
                    <strong>{consumoTeoricoTotal} kWh</strong>
                </div>
                <div className="col-md-2 card p-3 shadow-sm">
                    <h6>Medido Total</h6>
                    <strong>{consumoRealTotal.toFixed(2)} kWh</strong>
                </div>
            </div>

            <div className="mb-5">
                <h5>Comparativa gráfica:</h5>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={resumenGrafica}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="consumo" fill="#4285f4">
                            <LabelList dataKey="consumo" position="top" formatter={(v) => `${v} kWh`} />
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            <h5>Detalle por electrodoméstico:</h5>
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Electrodoméstico</th>
                        <th>Cantidad</th>
                        <th>Consumo Teórico (kWh)</th>
                        <th>Consumo Real Medido (kWh)</th>
                        <th>Participación Real (%)</th>
                    </tr>
                </thead>
                <tbody>
                    {detalleConsumo.map((item, idx) => (
                        <tr key={idx}>
                            <td>{item.nombre}</td>
                            <td>{item.cantidad}</td>
                            <td>{item.consumoTeorico} kWh</td>
                            <td>{item.consumoReal} kWh</td>
                            <td>{item.porcentaje} %</td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <div className="text-center mt-4">
                <button className="btn btn-outline-primary" onClick={() => setShowModal(true)}>
                    Simular consumo mensual estimado
                </button>
                <p className="mt-2 text-muted" style={{ fontSize: "0.9rem" }}>
                    Esta simulación se basa en los datos reales medidos de las últimas 4 horas por dispositivo.
                </p>
            </div>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Simulación de Consumo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group controlId="formHorasTV">
                            <Form.Label>¿Cuántas horas al día usas el televisor?</Form.Label>
                            <Form.Control
                                type="number"
                                min="1"
                                max="24"
                                value={horasTV}
                                onChange={(e) => setHorasTV(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group controlId="formLavadora" className="mt-3">
                            <Form.Label>¿Cuántas veces a la semana usas la lavadora?</Form.Label>
                            <Form.Control
                                type="number"
                                min="1"
                                max="30"
                                value={lavadasSemana}
                                onChange={(e) => setLavadasSemana(e.target.value)}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancelar
                    </Button>
                    <Button variant="primary" onClick={handleSimular}>
                        Simular
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default MiConsumo;
