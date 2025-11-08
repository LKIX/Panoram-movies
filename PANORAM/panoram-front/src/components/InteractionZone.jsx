import { useState, useEffect } from 'react';
import axios from 'axios';
// 1. Importa NUESTRO componente de estrellas
import StarRating from './StarRating.jsx'; 
import './InteractionZone.css';

function InteractionZone({ movieId }) {
  // Estados para la info de la BD
  const [interaction, setInteraction] = useState(null);
  const [loading, setLoading] = useState(true);

  // Estados para las acciones del usuario
  const [myRating, setMyRating] = useState(0);
  const [isWatched, setIsWatched] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // 1. Cargar la interacción existente cuando el componente monta
  useEffect(() => {
    async function fetchInteraction() {
      if (!movieId) return;
      try {
        setLoading(true);
        // Llama a la ruta del backend para obtener la info guardada
        const response = await axios.get(`http://localhost:5001/api/interact/${movieId}`);
        
        if (response.data) {
          // Si hay datos, rellenamos los estados
          setInteraction(response.data);
          setMyRating(response.data.rating || 0);
          setIsWatched(response.data.hasWatched || false);
          setIsFavorite(response.data.isFavorite || false);
        }
        setLoading(false);
      } catch (err) {
        console.error("Error cargando interacción:", err);
        setLoading(false);
      }
    }
    fetchInteraction();
  }, [movieId]); // Se ejecuta si el movieId cambia

  // 2. Función para ENVIAR cambios al backend
  const sendInteraction = async (dataToUpdate) => {
    try {
      // Llama a la ruta POST para guardar
      await axios.post('http://localhost:5001/api/interact', {
        movieId: movieId,
        ...dataToUpdate // Envía solo lo que cambió
      });
    } catch (err) {
      console.error("Error guardando interacción:", err);
    }
  };

  // 3. Handlers (Manejadores) de Clics
  const handleRatingChange = (newRating) => {
    setMyRating(newRating);
    // Al calificar, también la marcamos como vista
    sendInteraction({ rating: newRating, hasWatched: true }); 
  };

  const handleWatchToggle = () => {
    const newWatchStatus = !isWatched;
    setIsWatched(newWatchStatus);
    sendInteraction({ hasWatched: newWatchStatus });
  };

  const handleFavoriteToggle = () => {
    const newFavoriteStatus = !isFavorite;
    setIsFavorite(newFavoriteStatus);
    sendInteraction({ isFavorite: newFavoriteStatus });
  };

  if (loading) return <div className="interaction-zone">Cargando tu info...</div>;

  return (
    <div className="interaction-zone">
      <h3>Tu Interacción</h3>
      <div className="interaction-item">
        <span>Tu Calificación:</span>
        
        {/* 4. ¡EL CAMBIO! Usamos nuestro componente StarRating */}
        <StarRating
          count={10}
          rating={myRating}
          onRatingChange={handleRatingChange}
        />
        
      </div>
      <div className="interaction-item">
        <span>Marcar como vista:</span>
        <button 
          onClick={handleWatchToggle}
          className={`toggle-button ${isWatched ? 'active' : ''}`}
        >
          {isWatched ? 'VISTA' : 'NO VISTA'}
        </button>
      </div>
      <div className="interaction-item">
        <span>Añadir a Favoritos:</span>
        <button 
          onClick={handleFavoriteToggle}
          className={`toggle-button ${isFavorite ? 'active' : ''}`}
        >
          {isFavorite ? '❤️ FAVORITA' : '🤍 AÑADIR'}
        </button>
      </div>
    </div>
  );
}

export default InteractionZone;