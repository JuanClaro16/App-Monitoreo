import React, { useEffect, useState } from "react";
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, LabelList
} from "recharts";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../firebase";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);

const db = getFirestore(app);
const auth = getAuth(app);

const MiConsumo = () => {
    const [config, setConfig] = useState(null);
    const [sensorData, setSensorData] = useState({ total: 0, porDispositivo: {} });

    useEffect(() => {
        const fetchConfigurationAndData = async () => {
            const user = auth.currentUser;
            if (!user) return;

            const ref = doc(db, "usuarios", user.uid);
            const snap = await getDoc(ref);
            if (!snap.exists()) return;

            const data = snap.data();
            setConfig(data);

            const hoy = dayjs().tz("America/Bogota");
            const inicioDelDia = hoy.startOf('day');
            let totalEnergiaKWh = 0;
            const consumoPorDispositivo = {};
            const UMBRAL_MAXIMO_W = 300;

            for (const disp of data.dispositivos || []) {
                const res = await fetch(`http://localhost:8080/data/device?uuid=${disp.deviceUUID}`);
                const json = await res.json();

                const datosFiltrados = json.filter(d => {
                    const ts = dayjs.unix(d.timeStamp).tz("America/Bogota");
                    return ts.isSameOrAfter(inicioDelDia) && typeof d.values?.power === "number";
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
                    return promedio / 60;
                });

                const totalWh = consumos.reduce((acc, el) => acc + el, 0);
                const totalKWh = totalWh / 1000;
                totalEnergiaKWh += totalKWh;
                consumoPorDispositivo[disp.deviceUUID] = parseFloat(totalKWh.toFixed(4));
            }

            setSensorData({
                total: parseFloat(totalEnergiaKWh.toFixed(4)),
                porDispositivo: consumoPorDispositivo
            });
        };

        fetchConfigurationAndData();
        const intervalo = setInterval(fetchConfigurationAndData, 60000);
        return () => clearInterval(intervalo);
    }, []);

    if (!config) {
        return (
            <div className="container mt-5 text-center">
                <h3>No has configurado tus electrodomésticos</h3>
                <p>Por favor dirígete a <b>Ajustes de Consumo</b> para ingresar tu configuración antes de visualizar el resumen.</p>
            </div>
        );
    }

    const { consumoMensual, dispositivos } = config;

    const detalleConsumo = dispositivos.map(item => {
        const consumoTeorico = item.consumoTeorico * item.cantidad;
        const consumoReal = sensorData.porDispositivo?.[item.deviceUUID] || 0;
        const porcentaje = consumoMensual > 0 ? ((consumoReal / consumoMensual) * 100).toFixed(2) : "0.00";
        return {
            ...item,
            consumoTeorico,
            consumoReal: consumoReal.toFixed(2),
            porcentaje
        };
    });

    const consumoTeoricoTotal = detalleConsumo.reduce((acc, el) => acc + el.consumoTeorico, 0);
    const consumoRealTotal = sensorData.total;

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
        </div>
    );
};

export default MiConsumo;
