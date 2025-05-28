import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Registro = () => {
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [telefono, setTelefono] = useState('');
  const [usuario, setUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const navigate = useNavigate();

  const handleRegistro = (e) => {
    e.preventDefault();
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];

    if (usuarios.find(u => u.usuario === usuario)) {
      alert('El usuario ya existe');
      return;
    }

    usuarios.push({ usuario, contrasena, nombres, apellidos, telefono });
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    alert('Usuario registrado exitosamente');

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
          <input className="form-control" type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label>Usuario</label>
          <input className="form-control" value={usuario} onChange={(e) => setUsuario(e.target.value)} required />
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
