// Alerts.js
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { app } from "../firebase";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

const auth = getAuth(app);
const db = getFirestore(app);

const umbrales = {
    Nevera: { moderado: 160, excesivo: 190 }, // en W
    Televisor: { moderado: 110, excesivo: 150 },
    Lavadora: { moderado: 600, excesivo: 800 },
};

const Alerts = () => {
    const [datos, setDatos] = useState([]);
    const [dispositivos, setDispositivos] = useState([]);
    const [filtroDispositivo, setFiltroDispositivo] = useState("Todos");
    const [filtroEstado, setFiltroEstado] = useState("TODOS");

    useEffect(() => {
        const fetchData = async () => {
            const user = auth.currentUser;
            if (!user) return;

            const userRef = doc(db, "usuarios", user.uid);
            const userSnap = await getDoc(userRef);
            const userData = userSnap.data();
            const dispositivosUsuario = userData.dispositivos || [];
            setDispositivos(dispositivosUsuario);

            const resultados = [];
            for (const disp of dispositivosUsuario) {
                const response = await fetch(`http://localhost:8080/data/device?uuid=${disp.deviceUUID}`);
                const json = await response.json();

                const datosAgrupados = {};
                json.forEach(({ timeStamp, values }) => {
                    if (values.power > 1000) return; // Ignorar valores basura mayores a 1000 W

                    const fecha = dayjs.unix(timeStamp).tz("America/Bogota");
                    const minuto = fecha.format("YYYY-MM-DD HH:mm");
                    if (!datosAgrupados[minuto]) datosAgrupados[minuto] = [];
                    datosAgrupados[minuto].push(values.power);
                });

                Object.entries(datosAgrupados).forEach(([minuto, valores]) => {
                    const promedio = valores.reduce((a, b) => a + b, 0) / valores.length;
                    const { moderado, excesivo } = umbrales[disp.nombre] || {};

                    let estado = null;
                    if (promedio > excesivo) estado = "excesivo";
                    else if (promedio > moderado) estado = "moderado";
                    else return;

                    resultados.push({
                        dispositivo: disp.nombre,
                        consumo: promedio.toFixed(1),
                        fecha: minuto,
                        estado,
                    });
                });
            }

            resultados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
            setDatos(resultados);
        };

        fetchData();
    }, []);

    const datosFiltrados = datos.filter((d) => {
        return (
            (filtroDispositivo === "Todos" || d.dispositivo === filtroDispositivo) &&
            (filtroEstado === "TODOS" || d.estado === filtroEstado)
        );
    });

    const limpiarFiltros = () => {
        setFiltroDispositivo("Todos");
        setFiltroEstado("TODOS");
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4 text-danger">
                ⚡ Alertas de Consumo
            </h2>

            <div className="row mb-3">
                <div className="col-md-3">
                    <label>Filtrar por dispositivo:</label>
                    <select className="form-control" value={filtroDispositivo} onChange={(e) => setFiltroDispositivo(e.target.value)}>
                        <option value="Todos">Todos</option>
                        {dispositivos.map((d) => (
                            <option key={d.deviceUUID} value={d.nombre}>
                                {d.nombre}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="col-md-3">
                    <label>Filtrar por estado:</label>
                    <select className="form-control" value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)}>
                        <option value="TODOS">TODOS</option>
                        <option value="moderado">Moderado</option>
                        <option value="excesivo">Excesivo</option>
                    </select>
                </div>
                <div className="col-md-3 d-flex align-items-end">
                    <button className="btn btn-secondary" onClick={limpiarFiltros}>Limpiar filtros</button>
                </div>
            </div>

            <div className="mt-4">
                {datosFiltrados.map((alerta, i) => (
                    <div className="card border-success mb-3" key={i}>
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <h5 className="card-title">⚡ {alerta.dispositivo} – {alerta.consumo} W</h5>
                                <span className={`badge ${alerta.estado === "excesivo" ? "bg-danger" : "bg-warning text-dark"}`}>
                                    {alerta.estado.toUpperCase()}
                                </span>
                            </div>
                            <p className="card-text"><small className="text-muted">{alerta.fecha}</small></p>
                            <p className="card-text">
                                {alerta.estado === "excesivo" && "Exceso de consumo detectado."}
                                {alerta.estado === "moderado" && "Consumo moderado, revisar uso."}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Alerts;
