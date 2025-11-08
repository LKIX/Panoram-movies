import { useRef } from 'react';
import './MovieCarousel.css'; // Crearemos este CSS ahora
import { Link } from 'react-router-dom';
// 1. Recibimos "title" y "movies" como "props"
function MovieCarousel({ title, movies }) {
  // 2. Usamos "useRef" para apuntar al div del carrusel
  const carouselRef = useRef(null);

  // 3. Funciones para mover el scroll
  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -500, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 500, behavior: 'smooth' });
    }
  };

  return (
    <div className="carousel-section">
      <h2>{title}</h2>
      <div className="carousel-wrapper">
        {/* Botón Izquierdo */}
        <button className="carousel-button prev" onClick={scrollLeft}>
          &lt;
        </button>
        
        {/* 4. El carrusel (el div que "apuntamos" con el ref) */}
        <div className="movie-carousel" ref={carouselRef}>
        {movies.map(movie => (
          // 2. ENVUELVE LA TARJETA CON EL LINK
          // Usamos el _id de la película para la URL dinámica
          <Link to={`/movie/${movie._id}`} key={movie._id} className="movie-card-link">
            <div className="movie-card">
              <img src={movie.posterUrl} alt={movie.title} />
              <h4>{movie.title} ({movie.releaseYear})</h4>
              <p>Rating: {movie.averageRating}</p>
            </div>
          </Link>
        ))}
      </div>

        {/* Botón Derecho */}
        <button className="carousel-button next" onClick={scrollRight}>
          &gt;
        </button>
      </div>
    </div>
  );
}

export default MovieCarousel;