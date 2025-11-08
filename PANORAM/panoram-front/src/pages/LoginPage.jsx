import { useState, useContext } from 'react'; // <-- 1. IMPORTA useContext
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx'; // <-- 2. IMPORTA EL CEREBRO

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // <-- 3. SACA LA FUNCIÓN "login" DEL CEREBRO

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post('http://localhost:5001/api/users/login', {
        email: email,
        password: password
      });

      // 4. ¡ÉXITO!
      console.log('¡Login exitoso!');

      // 5. ¡CAMBIO CLAVE! Usa la función del cerebro para guardar todo
      login(response.data.token, response.data.username);

      // 6. Redireccionamos al usuario al "Home" (/)
      navigate('/'); 

    } catch (err) {
      console.error('Error en el login:', err);
      setError('Credenciales inválidas. Por favor, intenta de nuevo.');
    }
  };

  // El resto del return (el JSX) es exactamente el mismo...
  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Iniciar Sesión en Panoram</h2>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input 
            type="email" 
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required 
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input 
            type="password" 
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required 
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="login-button">Iniciar Sesión</button>
      </form>
    </div>
  );
}

export default LoginPage;