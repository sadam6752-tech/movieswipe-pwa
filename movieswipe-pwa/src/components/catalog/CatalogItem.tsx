import React from 'react';
import type { Movie } from '../../types/movie';
import { LazyImage } from '../common/LazyImage';
import { GENRE_LABELS } from '../../utils/constants';
import './CatalogItem.css';

interface CatalogItemProps {
  movie: Movie;
  onClick: (movieId: string) => void;
}

export const CatalogItem: React.FC<CatalogItemProps> = ({ movie, onClick }) => {
  const primaryGenre = movie.genres[0];
  const genreLabel = primaryGenre ? GENRE_LABELS[primaryGenre] : '';

  return (
    <div className="catalog-item" onClick={() => onClick(movie.id)}>
      <div className="catalog-item-poster">
        <LazyImage
          src={movie.poster}
          alt={movie.title}
          className="catalog-item-image"
        />
        <div className="catalog-item-overlay">
          <div className="catalog-item-rating">⭐ {movie.rating.toFixed(1)}</div>
        </div>
      </div>
      
      <div className="catalog-item-info">
        <h3 className="catalog-item-title">{movie.title}</h3>
        <div className="catalog-item-meta">
          <span className="catalog-item-year">{movie.year}</span>
          {genreLabel && (
            <>
              <span className="catalog-item-separator">•</span>
              <span className="catalog-item-genre">{genreLabel}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
