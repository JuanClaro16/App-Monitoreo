import React, { useState, useEffect } from 'react';

const SimuladorMedicion = () => {
    const [config, setConfig] = useState(null);
    const [electrodomesticoSeleccionado, setElectrodomesticoSeleccionado] = useState('');
    const [medicion, setMedicion] = useState('');

    useEffect(() => {
        const data = localStorage.getItem('configuracionConsumo');
        if (data) {
            setConfig(JSON.parse(data));
        }
    }, []);

    const guardarMedicion = () => {
        if (!electrodomesticoSeleccionado || !medicion || medicion < 0) {
            alert("Por favor ingresa una medición válida");
            return;
        }

        const nuevaConfig = { ...config };
        nuevaConfig.electrodomesticos = nuevaConfig.electrodomesticos.map(e => {
            if (e.nombre === electrodomesticoSeleccionado) {
                return { ...e, consumoReal: parseFloat(medicion) };
            }
            return e;
        });

        localStorage.setItem("configuracionConsumo", JSON.stringify(nuevaConfig));
        setConfig(nuevaConfig);
        setMedicion('');
        alert("Medición actualizada correctamente");
    };

    if (!config) {
        return <div className="container mt-5"><h4>No hay configuración previa</h4></div>;
    }

    return (
        <div className="container mt-4">
            <h2>Simulador de Medición</h2>

            <div className="mb-3">
                <label className="form-label">Selecciona el electrodoméstico que estás midiendo:</label>
                <select
                    className="form-control"
                    value={electrodomesticoSeleccionado}
                    onChange={(e) => setElectrodomesticoSeleccionado(e.target.value)}
                >
                    <option value="">-- Seleccionar --</option>
                    {config.electrodomesticos
                        .filter(e => e.activo)
                        .map((e, idx) => (
                            <option key={idx} value={e.nombre}>{e.nombre}</option>
                        ))}
                </select>
            </div>

            <div className="mb-3">
                <label className="form-label">Dato de consumo medido (kWh):</label>
                <input
                    type="number"
                    className="form-control"
                    value={medicion}
                    onChange={(e) => setMedicion(e.target.value)}
                    min={0}
                />
            </div>

            <button className="btn btn-primary" onClick={guardarMedicion}>
                Guardar Medición
            </button>
        </div>
    );
};

export default SimuladorMedicion;
