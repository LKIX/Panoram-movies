import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom'; // 1. IMPORTA useLocation
import { AuthContext } from '../context/AuthContext.jsx';
import './Navbar.css';
import SearchBar from './SearchBar.jsx';

function Navbar() {
  const { token, username, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  
  // 2. OBTÉN LA UBICACIÓN ACTUAL
  const location = useLocation(); // Esto nos da info de la URL, ej: { pathname: '/login' }

  // 3. DEFINE DÓNDE OCULTAR LA BÚSQUEDA
  const hideSearchOn = ['/login', '/register', '/perfil'];
  
  // 4. CREA LA VARIABLE DE DECISIÓN
  const showSearchBar = !hideSearchOn.includes(location.pathname);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        
        <Link to="/" className="navbar-logo">
          PANORAM
        </Link>

        {/* 5. ¡LA MAGIA! Muestra la barra O un espacio vacío */}
       {showSearchBar ? (
          <div className="navbar-search">
            {/* ¡EL CAMBIO AQUÍ! USAMOS EL COMPONENTE FUNCIONAL */}
            <SearchBar /> 
          </div>
        ) : (
          <div className="navbar-search-spacer" />
        )}

        {/* El resto (links de la derecha) no cambia */}
        <div className="navbar-links">
          {token ? (
            <>
              <span className="nav-username">Hola, {username}</span>
              <Link to="/perfil" className="nav-link">
                Mi Perfil
              </Link>
              <button onClick={handleLogout} className="nav-link nav-link-button">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                Login
              </Link>
              <Link to="/register" className="nav-link nav-link-button">
                Register
              </Link>
            </>
          )}
        </div>

      </div>
    </nav>
  );
}

export default Navbar;