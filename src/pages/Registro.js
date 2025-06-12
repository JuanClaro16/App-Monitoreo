import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Registro = () => {
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono, setTelefono] = useState('');
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const navigate = useNavigate();

  const handleRegistro = (e) => {
    e.preventDefault();

    const correoValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo);
    if (!correoValido) {
      toast.error("Correo electrónico no válido");
      return;
    }

    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    if (usuarios.find(u => u.correo === correo)) {
      toast.error('Ya existe un registro con este correo');
      return;
    }

    usuarios.push({ correo, contrasena, nombres, apellidos, telefono });
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    toast.success('Usuario registrado exitosamente');
    navigate('/ajustes');
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#f2f2f2' }}>
      <div className="card shadow p-4" style={{ width: '450px', borderTop: '5px solid #FFCC00' }}>
        <h2 className="text-center mb-4" style={{ color: '#FFCC00' }}>
          ⚡ App Monitoreo
        </h2>
        <h4 className="mb-4 text-center text-dark">Registro</h4>
        <form onSubmit={handleRegistro}>
          <div className="mb-3">
            <label>Nombres</label>
            <input className="form-control" value={nombres} onChange={(e) => setNombres(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label>Apellidos</label>
            <input className="form-control" value={apellidos} onChange={(e) => setApellidos(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label>Teléfono</label>
            <input
              className="form-control"
              type="tel"
              pattern="[0-9]*"
              inputMode="numeric"
              value={telefono}
              onChange={(e) => setTelefono(e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>
          <div className="mb-3">
            <label>Correo electrónico</label>
            <input
              type="email"
              className="form-control"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label>Contraseña</label>
            <input type="password" className="form-control" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
          </div>

          <button type="submit" className="btn w-100 mb-2" style={{ backgroundColor: '#002147', color: '#fff' }}>
            Registrarse
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary w-100"
            onClick={() => navigate('/login')}
          >
            ¿Ya tienes cuenta? Iniciar sesión
          </button>
        </form>
      </div>
    </div>
  );
};

export default Registro;
