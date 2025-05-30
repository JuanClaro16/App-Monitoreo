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

    // Validación de correo electrónico básica
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
    navigate('/login');
  };

  return (
    <div className="container mt-5">
      <h2>Registro</h2>
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
            className="form-control"
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label>Contraseña</label>
          <input type="password" className="form-control" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
        </div>
        <button className="btn btn-success">Registrarse</button>
      </form>
    </div>
  );
};

export default Registro;
