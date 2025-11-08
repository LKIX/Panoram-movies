import { useState, useEffect } from 'react'; // ¡Importamos useEffect!
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';

function SearchBar() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  // Función para limpiar la búsqueda y el menú
  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
  };

  // --- LÓGICA DE TECLADO ---
  useEffect(() => {
    // 1. Función manejadora del evento de teclado
    const handleEsc = (event) => {
      // Si la tecla presionada es 'Escape' y hay resultados visibles,
      // o si hay algo escrito en la caja, limpia la búsqueda.
      if (event.key === 'Escape') {
        clearSearch();
      }
    };

    // 2. Agrega el escuchador de eventos a la ventana
    window.addEventListener('keydown', handleEsc);

    // 3. Función de limpieza: REMUEVE el escuchador cuando el componente se desmonta
    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []); // El array vacío asegura que solo se monte y desmonte una vez.
  // -------------------------

  const fetchResults = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    
    try {
      const response = await axios.get(`http://localhost:5001/api/movies/search?query=${query}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error fetching search results:", error);
      setSearchResults([]);
    }
  };

  const handleInputChange = (event) => {
    const newTerm = event.target.value;
    setSearchTerm(newTerm);
    
    if (newTerm.trim() !== '') {
      fetchResults(newTerm);
    } else {
      setSearchResults([]);
    }
  };

  const handleResultClick = (movieId) => {
    navigate(`/movie/${movieId}`);
    clearSearch(); // Usamos la nueva función para limpiar
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && searchResults.length > 0) {
        handleResultClick(searchResults[0]._id);
    }
  };

  return (
    <div className="search-bar-container">
      <input
        type="text"
        placeholder="Buscar películas..."
        value={searchTerm}
        onChange={handleInputChange} 
        onKeyDown={handleKeyPress}
      />

      {/* El menú desplegable solo se muestra si hay un término (o sea, si no está cerrado) */}
      {searchTerm && searchResults.length > 0 && (
        <ul className="search-results-dropdown">
          {searchResults.map((movie) => (
            <li 
              key={movie._id} 
              onClick={() => handleResultClick(movie._id)}
            >
              {movie.title} ({movie.releaseYear})
            </li>
          ))}
        </ul>
      )}

      {/* Mensaje si no hay resultados */}
      {searchTerm.length >= 2 && searchResults.length === 0 && (
        <ul className="search-results-dropdown">
           <li className="no-results">No se encontraron resultados.</li>
        </ul>
      )}
    </div>
  );
}

export default SearchBar;