import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";

const electrodomesticosPorDefecto = [
    { nombre: "Nevera", consumo: 20 },
    { nombre: "Lavadora", consumo: 15 },
    { nombre: "Televisor", consumo: 5 },
    { nombre: "Aire Acondicionado", consumo: 50 },
    { nombre: "Microondas", consumo: 10 }
];

const Configuracion = () => {
    const [consumoMensual, setConsumoMensual] = useState("");
    const [electrodomesticos, setElectrodomesticos] = useState([]);

    useEffect(() => {
        const configGuardada = localStorage.getItem("configuracionConsumo");
        if (configGuardada) {
            const parsed = JSON.parse(configGuardada);
            // Agregamos el nuevo campo si no existe (para actualizar los registros antiguos)
            const actualizados = parsed.electrodomesticos.map(e => ({
                ...e,
                consumoReal: e.consumoReal ?? null
            }));
            setConsumoMensual(parsed.consumoMensual);
            setElectrodomesticos(actualizados);
        } else {
            setElectrodomesticos(
                electrodomesticosPorDefecto.map(e => ({
                    nombre: e.nombre,
                    consumo: e.consumo,
                    cantidad: 1,
                    activo: false,
                    consumoReal: null
                }))
            );
        }
    }, []);

    const actualizarEstado = (index, campo, valor) => {
        const actualizados = [...electrodomesticos];
        actualizados[index][campo] = campo === "activo" ? valor : parseInt(valor);
        setElectrodomesticos(actualizados);
    };

    const guardarConfiguracion = () => {
        if (!consumoMensual || consumoMensual <= 0) {
            toast.error("Por favor ingresa el consumo mensual reportado");
            return;
        }

        const configuracion = {
            consumoMensual: parseInt(consumoMensual),
            electrodomesticos: electrodomesticos
        };

        localStorage.setItem("configuracionConsumo", JSON.stringify(configuracion));
        toast.success("Configuración guardada exitosamente");
    };

    return (
        <div className="container mt-4">
            <h2>Configuración de Consumo</h2>

            <div className="mb-3">
                <label className="form-label">Consumo Mensual Reportado (según factura)</label>
                <input
                    type="number"
                    className="form-control"
                    placeholder="Ejemplo: 65"
                    value={consumoMensual}
                    onChange={e => setConsumoMensual(e.target.value)}
                />
            </div>

            <h5>Seleccione sus electrodomésticos:</h5>
            <table className="table table-bordered">
                <thead>
                    <tr>
                        <th>Electrodoméstico</th>
                        <th>Consumo Teórico (kWh)</th>
                        <th>¿Tiene este equipo?</th>
                        <th>Cantidad</th>
                    </tr>
                </thead>
                <tbody>
                    {electrodomesticos.map((item, index) => (
                        <tr key={index}>
                            <td>{item.nombre}</td>
                            <td>{item.consumo} kWh</td>
                            <td>
                                <input
                                    type="checkbox"
                                    checked={item.activo}
                                    onChange={e => actualizarEstado(index, "activo", e.target.checked)}
                                />
                            </td>
                            <td>
                                <input
                                    type="number"
                                    className="form-control"
                                    value={item.cantidad}
                                    onChange={e => actualizarEstado(index, "cantidad", e.target.value)}
                                    disabled={!item.activo}
                                    min={1}
                                />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button className="btn btn-primary w-100" onClick={guardarConfiguracion}>
                Guardar Configuración
            </button>
        </div>
    );
};

export default Configuracion;
