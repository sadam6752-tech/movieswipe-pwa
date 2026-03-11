import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Movie } from '../../types/movie';
import { LazyImage } from '../common/LazyImage';
import { GENRE_LABELS } from '../../utils/constants';
import './MovieCard.css';

interface MovieCardProps {
  movie: Movie;
  onClick?: () => void;
  style?: React.CSSProperties;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie, onClick, style }) => {
  const navigate = useNavigate();
  const primaryGenre = movie.genres[0];
  const genreLabel = primaryGenre ? GENRE_LABELS[primaryGenre] : '';

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(`/details/${movie.id}`);
    }
  };

  return (
    <div className="movie-card" onClick={handleClick} style={style}>
      <div className="movie-card-poster">
        <LazyImage
          src={movie.poster}
          alt={movie.title}
          className="movie-card-image"
        />
        <div className="movie-card-overlay">
          <div className="movie-card-rating">⭐ {movie.rating.toFixed(1)}</div>
        </div>
      </div>
      
      <div className="movie-card-info">
        <h3 className="movie-card-title">{movie.title}</h3>
        <div className="movie-card-meta">
          <span className="movie-card-year">{movie.year}</span>
          {genreLabel && (
            <>
              <span className="movie-card-separator">•</span>
              <span className="movie-card-genre">{genreLabel}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
