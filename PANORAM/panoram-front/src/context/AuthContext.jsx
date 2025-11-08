import { createContext, useState, useEffect } from 'react';
import axios from 'axios';

// 1. Creamos el "molde" del cerebro
const AuthContext = createContext();

// 2. Creamos el "Proveedor" del cerebro (el componente que lo envuelve todo)
function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Para saber si está cargando

  // 3. Efecto que corre UNA SOLA VEZ cuando la app carga
  useEffect(() => {
    // Revisa si ya teníamos un token guardado en el navegador
    const storedToken = localStorage.getItem('token');
    const storedUsername = localStorage.getItem('username');

    if (storedToken) {
      setToken(storedToken);
      setUsername(storedUsername);
      // ¡Importante! Le decimos a axios que use este token en TODOS los futuros pedidos
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
    }
    setIsLoading(false); // Terminamos de cargar
  }, []);

  // 4. Función de LOGIN (que usarán tus páginas)
  const login = (newToken, newUsername) => {
    // Guardamos en el navegador
    localStorage.setItem('token', newToken);
    localStorage.setItem('username', newUsername);
    // Guardamos en el "estado" de React
    setToken(newToken);
    setUsername(newUsername);
    // Le decimos a axios que use este token a partir de AHORA
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  };

  // 5. Función de LOGOUT
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setToken(null);
    setUsername(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  // 6. Compartimos los datos y funciones con toda la app
  return (
    <AuthContext.Provider value={{ token, username, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext, AuthProvider };