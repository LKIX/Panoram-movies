import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const authMiddleware = (req, res, next) => {
  // 1. Buscamos el token. Lo enviaremos en un "Header" llamado "Authorization"
  // El formato será: "Bearer TU_TOKEN_LARGUISIMO"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Sacamos solo el token

  if (token == null) {
    // 401 = No autorizado (No trajo el "Pase VIP")
    return res.status(401).json({ message: 'No hay token, permiso denegado' });
  }

  // 2. Verificamos el "Pase VIP"
  jwt.verify(token, process.env.JWT_SECRET, (err, userPayload) => {
    if (err) {
      // 403 = Prohibido (El "Pase VIP" es falso o expiró)
      return res.status(403).json({ message: 'Token no es válido' });
    }

    // 3. ¡El pase es válido!
    // Adjuntamos los datos del usuario (su ID) al objeto "req"
    // para que la siguiente ruta sepa QUIÉN está haciendo la petición
    req.user = userPayload;
    
    // Le decimos a Express que "siga" a la siguiente función (la ruta real)
    next(); 
  });
};

export default authMiddleware;