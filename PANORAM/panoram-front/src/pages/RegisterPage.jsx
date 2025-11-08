import { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx'; // Importa el cerebro

function RegisterPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // --- 1. NUEVOS ESTADOS para los campos del censo ---
  const [gender, setGender] = useState(''); // 'male' o 'female'
  const [birthdate, setBirthdate] = useState(''); // 'YYYY-MM-DD'
  
  const [error, setError] = useState(null);
  
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Saca la función login del cerebro

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // 2. Validar que los nuevos campos no estén vacíos
    if (!gender || !birthdate) {
      setError('Por favor, completa todos los campos (género y fecha de nacimiento).');
      return;
    }

    try {
      // 3. Enviar TODOS los campos al backend
      const response = await axios.post('http://localhost:5001/api/users/register', {
        username: username,
        email: email,
        password: password,
        gender: gender,
        birthdate: birthdate
      });

      // 4. ¡Éxito! Usamos la función del cerebro para loguear
      login(response.data.token, response.data.username);

      // 5. Redireccionamos al Home
      navigate('/'); 

    } catch (err) {
      console.error('Error en el registro:', err);
      setError(err.response?.data?.message || 'Error al registrar. Intenta de nuevo.');
    }
  };

  return (
    // Usamos el mismo contenedor y formulario que LoginPage
    <div className="login-container"> 
      <form onSubmit={handleSubmit} className="login-form">
        <h2>Crear Cuenta en Panoram</h2>
        
        {/* --- Campos existentes --- */}
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input 
            type="text" 
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required 
          />
        </div>

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
        
        <hr className="form-divider" />

        {/* --- 5. NUEVOS CAMPOS --- */}
        
        <div className="form-group">
          <label htmlFor="gender">Género</label>
          <select 
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
          >
            <option value="" disabled>Selecciona tu género</option>
            <option value="male">Masculino</option>
            <option value="female">Femenino</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="birthdate">Fecha de Nacimiento</label>
          <input 
            type="date" // Esto nos da un selector de calendario
            id="birthdate"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            required 
          />
        </div>

        {error && <p className="error-message">{error}</p>}

        <button type="submit" className="login-button">Crear Cuenta</button>
      </form>
    </div>
  );
}

export default RegisterPage;