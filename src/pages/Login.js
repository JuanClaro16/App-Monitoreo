import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {
  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    const usuariosGuardados = JSON.parse(localStorage.getItem("usuarios")) || [];
    const usuarioEncontrado = usuariosGuardados.find(
      (u) => u.correo === correo && u.contrasena === contrasena
    );

    if (usuarioEncontrado) {
      localStorage.setItem("usuarioActual", JSON.stringify(usuarioEncontrado));
      window.location.replace("/");
    } else {
      toast.error("Correo o contraseña incorrectos");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: '#f2f2f2' }}>
      <div className="card shadow p-4" style={{ width: '400px', borderTop: '5px solid #FFCC00' }}>
        <h2 className="text-center mb-4" style={{ color: '#FFCC00' }}>
          ⚡ App Monitoreo
        </h2>
        <h4 className="mb-4 text-center text-dark">Iniciar sesión</h4>
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label">Correo electrónico</label>
            <input
              type="email"
              className="form-control"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className="form-control"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn w-100 mb-2" style={{ backgroundColor: '#002147', color: '#fff' }}>
            Ingresar
          </button>
          <button
            type="button"
            className="btn btn-outline-secondary w-100"
            onClick={() => navigate('/registro')}
          >
            ¿No tienes cuenta? Regístrate
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
