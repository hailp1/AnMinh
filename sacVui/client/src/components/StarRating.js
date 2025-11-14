import React from 'react';

const StarRating = ({ rating, totalRatings, size = 'normal', interactive = false, onRatingChange }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  const handleStarClick = (starIndex) => {
    if (interactive && onRatingChange) {
      onRatingChange(starIndex + 1);
    }
  };

  // Tạo 5 sao
  for (let i = 0; i < 5; i++) {
    let starClass = 'star';
    
    if (i < fullStars) {
      starClass += ' filled';
    } else if (i === fullStars && hasHalfStar) {
      starClass += ' half';
    } else {
      starClass += ' empty';
    }

    stars.push(
      <span
        key={i}
        className={starClass}
        onClick={() => handleStarClick(i)}
        style={{ cursor: interactive ? 'pointer' : 'default' }}
      >
        ★
      </span>
    );
  }

  const sizeClass = size === 'large' ? 'star-rating-large' : 
                   size === 'small' ? 'star-rating-small' : '';
  
  const interactiveClass = interactive ? 'star-rating-interactive' : '';

  return (
    <div className={`star-rating ${sizeClass} ${interactiveClass}`}>
      <div className="rating-stars">
        {stars}
      </div>
      {totalRatings && (
        <span className="rating-text">
          {rating.toFixed(1)} ({totalRatings} đánh giá)
        </span>
      )}
    </div>
  );
};

export default StarRating;