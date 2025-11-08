import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children }) {
  // 1. Pregunta al "cerebro" si hay token y si está cargando
  const { token, isLoading } = useContext(AuthContext);

  // 2. Si está "cargando" (revisando localStorage),
  // mostramos un "cargando" para evitar un parpadeo.
  if (isLoading) {
    return <div>Cargando...</div>;
  }

  // 3. Si NO hay token, lo "pateamos" a la página de login
  if (!token) {
    // "replace" evita que pueda darle "atrás" y volver a la pág. protegida
    return <Navigate to="/login" replace />;
  }

  // 4. Si hay token, le damos acceso a la página (los "children")
  return children;
}

export default ProtectedRoute;