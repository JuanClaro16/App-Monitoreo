import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserCircle, FaCog, FaSignOutAlt } from 'react-icons/fa';

const Header = () => {
  const navigate = useNavigate();
  const [showMenu, setShowMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('usuarioActual');
    navigate('/login');
  };

  const handleToggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleGoToAjustes = () => {
    navigate('/ajustes');
    setShowMenu(false);
  };

  return (
    <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-white shadow-sm">
      <h5 className="mb-0 fw-bold"></h5>

      <div className="position-relative">
        <FaUserCircle size={30} style={{ cursor: 'pointer' }} onClick={handleToggleMenu} />

        {showMenu && (
          <div className="position-absolute end-0 mt-2 bg-white shadow rounded py-2" style={{ minWidth: '180px', zIndex: 100 }}>
            <div 
              className="dropdown-item d-flex align-items-center px-3 py-2" 
              style={{ cursor: 'pointer' }} 
              onClick={handleGoToAjustes}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f0f0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              <FaCog className="me-2" /> Ajustes de Consumo
            </div>

            <div 
              className="dropdown-item d-flex align-items-center px-3 py-2 text-danger" 
              style={{ cursor: 'pointer' }} 
              onClick={handleLogout}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ffecec'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'white'}
            >
              <FaSignOutAlt className="me-2" /> Cerrar Sesión
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
