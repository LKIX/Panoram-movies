import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../App.css'; 
import InteractionZone from '../components/InteractionZone.jsx';

function MovieDetailPage() {
  const { movieId } = useParams(); 
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchMovie() {
      try {
        setLoading(true);
        setError(null);
        // Esta ruta ya trae 'director' y 'actors' gracias al script
        const response = await axios.get(`http://localhost:5001/api/movies/${movieId}`);
        setMovie(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error al traer la película:", err);
        setError("No se pudo cargar la película.");
        setLoading(false);
      }
    }
    fetchMovie();
  }, [movieId]);

  if (loading) return <div>Cargando detalles...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;
  if (!movie) return <div>Película no encontrada.</div>;

  return (
    <div className="detail-page-container">
      
      <img 
        src={movie.posterUrl} 
        alt={movie.title} 
        className="detail-page-image" 
      />
      
      <div className="detail-page-info">
        <h1>{movie.title} ({movie.releaseYear})</h1>
        <p><strong>Rating:</strong> {movie.averageRating ? movie.averageRating.toFixed(1) : 'N/A'} / 10</p>
        
        <h3>Sinopsis</h3>
        <p>{movie.synopsis}</p>
        <p><strong>Géneros:</strong> {movie.genres.join(', ')}</p>

        {/* --- ¡NUEVA SECCIÓN DE CRÉDITOS! --- */}
        <div className="movie-credits">
          {/* Mostramos al Director (si existe) */}
          {movie.director && movie.director !== 'No disponible' && (
            <p><strong>Director:</strong> {movie.director}</p>
          )}

          {/* Mostramos a los Actores (si existen y la lista no está vacía) */}
          {movie.actors && movie.actors.length > 0 && (
            <p><strong>Actores:</strong> {movie.actors.join(', ')}</p>
          )}
        </div>
        {/* --- FIN DE LA NUEVA SECCIÓN --- */}

        <InteractionZone movieId={parseInt(movieId)} />
      </div>
    </div>
  );
}

export default MovieDetailPage;