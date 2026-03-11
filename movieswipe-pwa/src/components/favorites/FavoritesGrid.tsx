import React from 'react';
import type { Movie } from '../../types/movie';
import { LazyImage } from '../common/LazyImage';
import './FavoritesGrid.css';

interface FavoritesGridProps {
  movies: Movie[];
  onRemove: (movieId: string) => void;
  onClick: (movieId: string) => void;
}

export const FavoritesGrid: React.FC<FavoritesGridProps> = ({ movies, onRemove, onClick }) => {
  const handleRemove = (e: React.MouseEvent, movieId: string) => {
    e.stopPropagation();
    onRemove(movieId);
  };

  return (
    <div className="favorites-grid">
      {movies.map((movie) => (
        <div 
          key={movie.id} 
          className="favorites-grid-item"
          onClick={() => onClick(movie.id)}
        >
          <div className="favorites-grid-poster">
            <LazyImage
              src={movie.poster}
              alt={movie.title}
              className="favorites-grid-image"
            />
            <div className="favorites-grid-overlay">
              <div className="favorites-grid-rating">⭐ {movie.rating.toFixed(1)}</div>
              <button 
                className="favorites-grid-remove"
                onClick={(e) => handleRemove(e, movie.id)}
                aria-label="Удалить из избранного"
              >
                ✕
              </button>
            </div>
          </div>
          
          <div className="favorites-grid-info">
            <h3 className="favorites-grid-title">{movie.title}</h3>
            <div className="favorites-grid-year">{movie.year}</div>
          </div>
        </div>
      ))}
    </div>
  );
};
