import React, { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, LabelList } from "recharts";

const MiConsumo = () => {
    const [config, setConfig] = useState(null);
    const [sensorData, setSensorData] = useState(75); // dato general simulado

    useEffect(() => {
        const savedConfig = localStorage.getItem("configuracionConsumo");
        if (savedConfig) {
            setConfig(JSON.parse(savedConfig));
        }
    }, []);

    if (!config) {
        return (
            <div className="container mt-5 text-center">
                <h3>No has configurado tus electrodomésticos</h3>
                <p>Por favor dirígete a <b>Ajustes de Consumo</b> para ingresar tu configuración antes de visualizar el resumen.</p>
            </div>
        );
    }

    const { consumoMensual, electrodomesticos } = config;

    // Procesamos solo los activos
    const detalleConsumo = electrodomesticos
        .filter(item => item.activo)
        .map(item => {
            const consumoTeorico = item.consumo * item.cantidad;
            const consumoReal = item.consumoReal ?? 0;
            return { ...item, consumoTeorico, consumoReal };
        });

    const consumoTeoricoTotal = detalleConsumo.reduce((acc, el) => acc + el.consumoTeorico, 0);
    const consumoRealTotal = detalleConsumo.reduce((acc, el) => acc + el.consumoReal, 0);
    const diferenciaTeorica = consumoTeoricoTotal - consumoMensual;
    const diferenciaMedida = sensorData - consumoMensual;

    const resumenGrafica = [
        { name: "Reportado", consumo: consumoMensual },
        { name: "Teórico", consumo: consumoTeoricoTotal },
        { name: "Medido Total", consumo: sensorData }
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
                    <strong>{sensorData} kWh</strong>
                </div>
                <div className="col-md-2 card p-3 shadow-sm">
                    <h6>Desv. Teórica</h6>
                    <strong>{diferenciaTeorica} kWh</strong>
                </div>
                <div className="col-md-2 card p-3 shadow-sm">
                    <h6>Desv. Medida</h6>
                    <strong>{diferenciaMedida} kWh</strong>
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
                        <th>Participación Teórica (%)</th>
                    </tr>
                </thead>
                <tbody>
                    {detalleConsumo.map((item, idx) => {
                        const porcentaje = consumoTeoricoTotal ? ((item.consumoTeorico / consumoTeoricoTotal) * 100).toFixed(1) : 0;
                        return (
                            <tr key={idx}>
                                <td>{item.nombre}</td>
                                <td>{item.cantidad}</td>
                                <td>{item.consumoTeorico} kWh</td>
                                <td>{item.consumoReal} kWh</td>
                                <td>{porcentaje} %</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
};

export default MiConsumo;
