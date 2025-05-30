import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const Login = () => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const usuarios = JSON.parse(localStorage.getItem('usuarios')) || [];
    const usuarioEncontrado = usuarios.find(
      (u) => u.correo === correo && u.contrasena === contrasena
    );

    if (usuarioEncontrado) {
      localStorage.setItem("usuarioActual", JSON.stringify(usuarioEncontrado));
      window.location.replace("/");
    } else {
      alert("Usuario o contraseña incorrectos");
    }
  };

  return (
    <div className="container mt-5">
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleLogin}>
        <div className="mb-3">
          <label>Correo electrónico</label>
          <input type="email" className="form-control" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label>Contraseña</label>
          <input type="password" className="form-control" value={contrasena} onChange={(e) => setContrasena(e.target.value)} required />
        </div>
        <button className="btn btn-primary">Ingresar</button>
        <button type="button" className="btn btn-link" onClick={() => navigate('/registro')}>
          ¿No tienes cuenta? Regístrate
        </button>
      </form>
    </div>
  );
};

export default Login;
