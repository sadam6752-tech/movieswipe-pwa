import React from 'react';
import type { Movie, Country } from '../../types/movie';
import { LazyImage } from '../common/LazyImage';
import { useLanguage } from '../../hooks/useLanguage';
import './MovieInfo.css';

interface MovieInfoProps {
  movie: Movie;
}

export const MovieInfo: React.FC<MovieInfoProps> = ({ movie }) => {
  const { t, getGenreName, getCountryName, language } = useLanguage();
  
  const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (language === 'en') {
      return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
    } else if (language === 'de') {
      return hours > 0 ? `${hours}Std ${mins}Min` : `${mins}Min`;
    }
    return hours > 0 ? `${hours}ч ${mins}м` : `${mins}м`;
  };

  return (
    <div className="movie-info">
      {/* Backdrop */}
      <div className="movie-info-backdrop">
        <LazyImage
          src={movie.backdrop}
          alt={movie.title}
          className="movie-info-backdrop-image"
        />
        <div className="movie-info-backdrop-overlay" />
      </div>

      {/* Main info with poster */}
      <div className="movie-info-main">
        <div className="movie-info-poster">
          <LazyImage
            src={movie.poster}
            alt={movie.title}
            className="movie-info-poster-image"
          />
        </div>

        <div className="movie-info-header">
          <h1 className="movie-info-title">{movie.title}</h1>
          {movie.originalTitle !== movie.title && (
            <p className="movie-info-original-title">{movie.originalTitle}</p>
          )}
          
          <div className="movie-info-meta">
            <div className="movie-info-rating">
              ⭐ {movie.rating.toFixed(1)}
            </div>
            <span className="movie-info-year">{movie.year}</span>
            <span className="movie-info-separator">•</span>
            <span className="movie-info-duration">{formatDuration(movie.duration)}</span>
          </div>
        </div>
      </div>

      {/* Content sections */}
      <div className="movie-info-content">
        {/* Description */}
        <div className="movie-info-section">
          <h2 className="movie-info-section-title">{t.details.genres}</h2>
          <p className="movie-info-description">{movie.description}</p>
        </div>

        {/* Genres */}
        <div className="movie-info-section">
          <h2 className="movie-info-section-title">{t.details.genres}</h2>
          <div className="movie-info-genres">
            {movie.genres.map((genre) => (
              <span key={genre} className="movie-info-genre-tag">
                {getGenreName(genre)}
              </span>
            ))}
          </div>
        </div>

        {/* Countries */}
        {movie.countries && movie.countries.length > 0 && (
          <div className="movie-info-section">
            <h2 className="movie-info-section-title">{t.catalog.countries}</h2>
            <div className="movie-info-genres">
              {movie.countries.map((country, index) => (
                <span key={index} className="movie-info-genre-tag">
                  {getCountryName(country as Country)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Moods */}
        {movie.moods.length > 0 && (
          <div className="movie-info-section">
            <h2 className="movie-info-section-title">{t.mood.title}</h2>
            <div className="movie-info-moods">
              {movie.moods.map((mood) => (
                <span key={mood} className="movie-info-mood-tag">
                  {(t.moods as Record<string, string>)[mood] || mood}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Director */}
        <div className="movie-info-section">
          <div className="movie-info-detail">
            <span className="movie-info-detail-label">{t.details.director}</span>
            <span className="movie-info-detail-value">{movie.director}</span>
          </div>
        </div>

        {/* Cast */}
        {movie.cast.length > 0 && (
          <div className="movie-info-section">
            <h2 className="movie-info-section-title">{t.details.cast}</h2>
            <div className="movie-info-cast-list">
              {movie.cast.map((actor, index) => (
                <span key={index} className="movie-info-cast-item">
                  {actor}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
