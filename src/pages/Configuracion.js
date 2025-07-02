import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { app } from "../firebase";

// Ahora cada electrodoméstico tiene un ID interno (deviceUUID)
const electrodomesticosPorDefecto = [
    { nombre: "Nevera", consumo: 20, deviceUUID: "2" },
    { nombre: "Lavadora", consumo: 15, deviceUUID: "3" },
    { nombre: "Televisor", consumo: 5, deviceUUID: "1" },
    { nombre: "Aire Acondicionado", consumo: 50, deviceUUID: "4" },
    { nombre: "Microondas", consumo: 10, deviceUUID: "5" },
];

const Configuracion = () => {
    const [consumoMensual, setConsumoMensual] = useState("");
    const [electrodomesticos, setElectrodomesticos] = useState([]);

    const auth = getAuth(app);
    const db = getFirestore(app);

    useEffect(() => {
        const cargarConfiguracion = async () => {
            const user = auth.currentUser;
            if (!user) {
                toast.error("Usuario no autenticado");
                return;
            }

            try {
                const ref = doc(db, "usuarios", user.uid);
                const docSnap = await getDoc(ref);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setConsumoMensual(data.consumoMensual || "");

                    const base = electrodomesticosPorDefecto.map(e => ({
                        ...e,
                        cantidad: 1,
                        activo: false
                    }));

                    const activos = data.dispositivos || [];
                    const completos = base.map(e => {
                        const encontrado = activos.find(d => d.nombre === e.nombre);
                        return encontrado
                            ? { ...e, activo: true, cantidad: encontrado.cantidad }
                            : e;
                    });

                    setElectrodomesticos(completos);
                } else {
                    setElectrodomesticos(
                        electrodomesticosPorDefecto.map(e => ({
                            ...e,
                            cantidad: 1,
                            activo: false
                        }))
                    );
                }
            } catch (err) {
                console.error("Error cargando configuración:", err);
                toast.error("No se pudo cargar la configuración");
            }
        };

        cargarConfiguracion();
    }, []);

    const actualizarEstado = (index, campo, valor) => {
        const actualizados = [...electrodomesticos];
        actualizados[index][campo] = campo === "activo" ? valor : parseInt(valor);
        setElectrodomesticos(actualizados);
    };

    const guardarConfiguracion = async () => {
        if (!consumoMensual || consumoMensual <= 0) {
            toast.error("Por favor ingresa el consumo mensual reportado");
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            toast.error("Usuario no autenticado");
            return;
        }

        const dispositivosSeleccionados = electrodomesticos
            .filter(e => e.activo)
            .map(e => ({
                nombre: e.nombre,
                consumoTeorico: e.consumo,
                cantidad: e.cantidad,
                deviceUUID: e.deviceUUID  // 👈 Aquí se guarda internamente el ID correcto
            }));

        try {
            await updateDoc(doc(db, "usuarios", user.uid), {
                consumoMensual: parseInt(consumoMensual),
                dispositivos: dispositivosSeleccionados
            });

            toast.success("Configuración guardada exitosamente");
        } catch (error) {
            console.error("Error al guardar:", error);
            toast.error("Error al guardar la configuración");
        }
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
