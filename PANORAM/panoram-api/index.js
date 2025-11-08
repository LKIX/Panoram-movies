import express from 'express';
import dotenv from 'dotenv';
// 1. Importamos las funciones de nuestra base de datos
import { connectDB, getDB } from './db.js';
import userRoutes from './routes/userRoutes.js';
import interactionRoutes from './routes/interactionRoutes.js'
import recommendRoutes from './routes/recommendRoutes.js';
import cors from 'cors';

// Configuración inicial
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(express.json());

app.use(cors());

// --- RUTAS DE LA API --
// -
// --- RUTA: GET /api/movies/popular ---
app.get('/api/movies/popular', async (req, res) => {
  try {
    const db = getDB(); 
    
    
    const movies = await db.collection('movies')
      .find() 
      .sort({ averageRating: -1 }) 
      .limit(20) 
      .toArray(); 
    
    res.json(movies); 

  } catch (e) {
    console.error("Error al obtener películas", e);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

// --- RUTA: GET /api/movies/search ---
// ESTA ES LA RUTA DE BÚSQUEDA DE PELÍCULAS QUE FALTABA
app.get('/api/movies/search', async (req, res) => {
  try {
    const db = getDB();
    // 1. Obtiene el término de búsqueda del frontend
    const { query } = req.query; 

    if (!query) {
      return res.json([]); 
    }

    // 2. Busca en la colección 'movies' por el título
    // $regex y $options: 'i' permiten buscar coincidencias parciales sin importar mayúsculas
    const searchResults = await db.collection('movies').find({
      title: { $regex: query, $options: 'i' }
    }).toArray();

    // 3. Devuelve los resultados
    res.json(searchResults);
    
  } catch (e) {
    console.error("Error al buscar películas:", e);
    res.status(500).json({ message: 'Error en el servidor al buscar.' });
  }
});

app.get('/api/movies/:id', async (req, res) => {
  try {
    const db = getDB();
    const movieId = parseInt(req.params.id); // 1. Obtenemos el ID de la URL

    if (isNaN(movieId)) {
      return res.status(400).json({ message: 'ID de película inválido' });
    }

    // 2. Buscamos en la colección 'movies' por ese _id
    const movie = await db.collection('movies').findOne({ _id: movieId });

    if (!movie) {
      return res.status(404).json({ message: 'Película no encontrada' });
    }

    res.json(movie); // 3. Devolvemos la película encontrada

  } catch (e) {
    console.error("Error al obtener película por ID", e);
    res.status(500).json({ message: "Error en el servidor" });
  }
});

app.use('/api/interact', interactionRoutes);
// Todo lo que empiece con /api/users será manejado por "userRoutes"
app.use('/api/users', userRoutes);

app.use('/api/interact', interactionRoutes);

app.use('/api/recommend', recommendRoutes);

// --- INICIAR EL SERVIDOR ---
async function startServer() {
  try {
    // 2. ¡Conectamos a la BD PRIMERO!
    await connectDB(); 
    
    // 3. Solo si la BD conecta, iniciamos el servidor web
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (e) {
    console.error("No se pudo iniciar el servidor", e);
  }
}

// 4. Ejecutamos la función de arranque
startServer();