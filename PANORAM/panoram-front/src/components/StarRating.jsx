import React, { useState } from 'react';
import './StarRating.css'; // Crearemos este CSS

// Este es nuestro componente de estrellas. ¡Cero dependencias!
function StarRating({ count = 10, rating = 0, onRatingChange }) {
  // Estado "hover" para saber qué estrella está viendo el mouse
  const [hover, setHover] = useState(0);

  return (
    <div className="star-rating-container">
      {[...Array(count)].map((star, index) => {
        const ratingValue = index + 1; // El valor de esta estrella (1, 2, 3... 10)

        return (
          <span
            key={index}
            className={`star ${ratingValue <= (hover || rating) ? 'active' : ''}`}
            onClick={() => onRatingChange(ratingValue)}
            onMouseEnter={() => setHover(ratingValue)}
            onMouseLeave={() => setHover(0)}
          >
            ★
          </span>
        );
      })}
    </div>
  );
}

export default StarRating;