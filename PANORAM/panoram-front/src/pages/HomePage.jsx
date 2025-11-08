import { useState, useEffect } from 'react';
import axios from 'axios';
import MovieCarousel from '../components/MovieCarousel.jsx';

function HomePage() {
  const [popularMovies, setPopularMovies] = useState([]);
  const [friendMovies, setFriendMovies] = useState([]);
  const [genreMovies, setGenreMovies] = useState([]);
  const [demoMovies, setDemoMovies] = useState([]);
  const [directorMovies, setDirectorMovies] = useState([]);
  const [actorMovies, setActorMovies] = useState([]);

  // "Caja" para guardar el "mapa" de nuestras interacciones
  const [myInteractions, setMyInteractions] = useState({});
  
  const [error, setError] = useState(null); 

  useEffect(() => {
    
    // Función 1: Cargar nuestras interacciones
    async function fetchMyInteractions() {
      try {
        // Llama a la ruta que devuelve el "mapa"
        const response = await axios.get('http://localhost:5001/api/interact/lists/all');
        setMyInteractions(response.data);
      } catch (err) {
        console.error("Error al traer mis interacciones:", err);
      }
    }
    
    // Función 2: Cargar Populares
    async function fetchPopularMovies() {
      try {
        const response = await axios.get('http://localhost:5001/api/movies/popular');
        setPopularMovies(response.data); 
      } catch (err) {
        console.error("Error al traer Populares:", err);
        setError("Error al cargar películas populares.");
      }
    }

    // Función 3: Cargar Recomendaciones de Amigos
    async function fetchFriendMovies() {
      try {
        const response = await axios.get('http://localhost:5001/api/recommend/friends');
        setFriendMovies(response.data.map(rec => rec.movie)); 
      } catch (err) {
        console.error("Error al traer Amigos:", err);
      }
    }

    // Función 4: Cargar Recomendaciones por Género
    async function fetchGenreMovies() {
      try {
        const response = await axios.get('http://localhost:5001/api/recommend/genre');
        setGenreMovies(response.data); 
      } catch (err) {
        console.error("Error al traer Géneros:", err);
      }
    }

    async function fetchDemographicMovies() {
      try {
        const response = await axios.get('http://localhost:5001/api/recommend/demographic');
        setDemoMovies(response.data); 
      } catch (err) {
        console.error("Error al traer Demográficas:", err);
      }
    }

    async function fetchDirectorMovies() {
      try {
        const response = await axios.get('http://localhost:5001/api/recommend/director');
        setDirectorMovies(response.data); 
      } catch (err) { console.error("Error al traer Director:", err); }
    }
    
    async function fetchActorMovies() {
      try {
        const response = await axios.get('http://localhost:5001/api/recommend/actor');
        setActorMovies(response.data); 
      } catch (err) { console.error("Error al traer Actor:", err); }
    }

    // Ejecutamos las cuatro funciones
    fetchMyInteractions();
    fetchPopularMovies();
    fetchFriendMovies();
    fetchGenreMovies();
    fetchDemographicMovies();
    fetchDirectorMovies(); 
    fetchActorMovies();
    
  }, []); // El [] vacío asegura que solo se ejecute una vez

  return (
    <> 
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Pasamos "myInteractions" a cada carrusel */}
      <MovieCarousel 
        title="Populares del Momento" 
        movies={popularMovies}
        interactions={myInteractions} 
      />
      
      {friendMovies.length > 0 && (
        <MovieCarousel 
          title="Recomendaciones de amigos" 
          movies={friendMovies}
          interactions={myInteractions}
        />
      )}
      
      {genreMovies.length > 0 && (
        <MovieCarousel 
          title="De tus géneros favoritos" 
          movies={genreMovies}
          interactions={myInteractions}
        />
      )}
      {demoMovies.length > 0 && (
        <MovieCarousel 
          title="Popular en tu demografía" 
          movies={demoMovies}
          interactions={myInteractions}
        />
      )}
      {directorMovies.length > 0 && (
        <MovieCarousel 
          title="De tus Directores Favoritos" 
          movies={directorMovies}
          interactions={myInteractions}
        />
      )}
      {actorMovies.length > 0 && (
        <MovieCarousel 
          title="Con tus Actores Favoritos" 
          movies={actorMovies}
          interactions={myInteractions}
        />
      )}
    </>
  );
}

export default HomePage;