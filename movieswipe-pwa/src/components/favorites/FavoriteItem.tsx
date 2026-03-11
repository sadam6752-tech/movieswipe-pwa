import React from 'react';
import type { Movie } from '../../types/movie';
import { LazyImage } from '../common/LazyImage';
import { GENRE_LABELS } from '../../utils/constants';
import './FavoriteItem.css';

interface FavoriteItemProps {
  movie: Movie;
  onRemove: (movieId: string) => void;
  onClick: (movieId: string) => void;
}

export const FavoriteItem: React.FC<FavoriteItemProps> = ({ movie, onRemove, onClick }) => {
  const primaryGenre = movie.genres[0];
  const genreLabel = primaryGenre ? GENRE_LABELS[primaryGenre] : '';

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove(movie.id);
  };

  return (
    <div className="favorite-item" onClick={() => onClick(movie.id)}>
      <div className="favorite-item-poster">
        <LazyImage
          src={movie.poster}
          alt={movie.title}
          className="favorite-item-image"
        />
        <div className="favorite-item-rating">⭐ {movie.rating.toFixed(1)}</div>
      </div>
      
      <div className="favorite-item-info">
        <h3 className="favorite-item-title">{movie.title}</h3>
        <div className="favorite-item-meta">
          <span className="favorite-item-year">{movie.year}</span>
          {genreLabel && (
            <>
              <span className="favorite-item-separator">•</span>
              <span className="favorite-item-genre">{genreLabel}</span>
            </>
          )}
        </div>
      </div>

      <button 
        className="favorite-item-remove"
        onClick={handleRemove}
        aria-label="Удалить из избранного"
      >
        ✕
      </button>
    </div>
  );
};
