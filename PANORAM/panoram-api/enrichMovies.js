import { connectDB, getDB } from './db.js';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config(); // Carga las variables de entorno (API Key)

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

async function fetchCredits(movieId) {
  try {
    
    const response = await axios.get(
      `${TMDB_BASE_URL}/movie/${movieId}/credits?api_key=${TMDB_API_KEY}&language=es-ES`
    );
    
    const data = response.data;
    
    //  Encontrar al Director
    const director = data.crew.find(person => person.job === 'Director');
    
    // Obtener los 5 actores principales (ordenados por "order")
    const actors = data.cast
      .sort((a, b) => a.order - b.order) 
      .slice(0, 5) 
      .map(actor => actor.name); 
      
    return {
      director: director ? director.name : 'No disponible',
      actors: actors
    };
    
  } catch (err) {
    console.error(`Error al buscar créditos para película ${movieId}:`, err.message);
    return null;
  }
}

async function runEnrichment() {
  console.log('Iniciando script de enriquecimiento...');
  await connectDB();
  const db = getDB();
  const moviesCollection = db.collection('movies');

  // Obtiene TODAS las películas de la BD
  const movies = await moviesCollection.find({}).toArray();
  console.log(`Se encontraron ${movies.length} películas para enriquecer.`);

  let updatedCount = 0;

  for (const movie of movies) {
   
    if (movie.actors && movie.actors.length > 0) {
      continue;
    }

    console.log(`Procesando: ${movie.title} (ID: ${movie._id})...`);
    
   
    const credits = await fetchCredits(movie._id);
    
    if (credits) {
      
      await moviesCollection.updateOne(
        { _id: movie._id },
        {
          $set: {
            director: credits.director,
            actors: credits.actors
          }
        }
      );
      updatedCount++;
      
      await new Promise(resolve => setTimeout(resolve, 300)); 
    }
  }

  console.log('--- ¡Enriquecimiento Completado! ---');
  console.log(`Se actualizaron ${updatedCount} películas.`);
  process.exit();
}


runEnrichment();