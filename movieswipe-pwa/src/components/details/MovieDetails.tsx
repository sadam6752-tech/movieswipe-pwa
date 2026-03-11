import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMovieStore } from '../../store/movieStore';
import { useFavoritesStore } from '../../store/favoritesStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useLanguage } from '../../hooks/useLanguage';
import { syncService } from '../../services/syncService';
import { movieService } from '../../services/movieService';
import { MovieInfo } from './MovieInfo';
import { LoadingSpinner } from '../common/LoadingSpinner';
import './MovieDetails.css';

export const MovieDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const movies = useMovieStore((state) => state.movies);
  const loadMovies = useMovieStore((state) => state.loadMovies);
  const { favorites, toggleFavorite } = useFavoritesStore();
  const tmdbApiKey = useSettingsStore((state) => state.tmdbApiKey);
  const { t } = useLanguage();
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  const movie = movies.find((m) => m.id === id);
  const isFavorite = favorites.some((f) => f.id === id);

  // Load movie details if from TMDB and details are missing
  useEffect(() => {
    const loadDetails = async () => {
      if (!movie || !id || !tmdbApiKey) return;
      
      // Check if movie is from TMDB and missing details
      const isTMDBMovie = id.startsWith('tmdb-');
      const hasDetails = movie.director !== 'Неизвестно' || movie.cast.length > 0;
      
      if (isTMDBMovie && !hasDetails && !isLoadingDetails) {
        setIsLoadingDetails(true);
        
        try {
          const details = await syncService.fetchMovieDetails(id, tmdbApiKey);
          
          if (details) {
            // Update movie in database
            await movieService.updateMovieDetails(id, details);
            
            // Reload movies to get updated data
            await loadMovies();
          }
        } catch (error) {
          console.error('Error loading movie details:', error);
        } finally {
          setIsLoadingDetails(false);
        }
      }
    };

    loadDetails();
  }, [movie, id, tmdbApiKey, isLoadingDetails, loadMovies]);

  useEffect(() => {
    if (!movie && movies.length > 0) {
      // Фильм не найден, возвращаемся назад
      navigate(-1);
    }
  }, [movie, movies, navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleToggleFavorite = async () => {
    if (!id || isTogglingFavorite) return;
    
    setIsTogglingFavorite(true);
    await toggleFavorite(id);
    setIsTogglingFavorite(false);
  };

  if (!movie) {
    return (
      <div className="movie-details">
        <div className="movie-details-loading">
          <LoadingSpinner text={t.common.loading} />
        </div>
      </div>
    );
  }

  return (
    <div className="movie-details">
      {/* Header with back button */}
      <div className="movie-details-header">
        <button 
          className="movie-details-back"
          onClick={handleBack}
          aria-label={t.common.back}
        >
          ← {t.common.back}
        </button>
        {isLoadingDetails && (
          <span className="movie-details-loading-badge">
            {t.details.loadingDetails}
          </span>
        )}
      </div>

      {/* Movie info */}
      <MovieInfo movie={movie} />

      {/* Action buttons */}
      <div className="movie-details-actions">
        <button
          className="movie-details-back-button"
          onClick={handleBack}
        >
          ← {t.common.back}
        </button>
        
        <button
          className={`movie-details-favorite-button ${isFavorite ? 'active' : ''}`}
          onClick={handleToggleFavorite}
          disabled={isTogglingFavorite}
        >
          <span className="movie-details-favorite-icon">
            {isFavorite ? '❤️' : '🤍'}
          </span>
          <span className="movie-details-favorite-text">
            {isFavorite ? t.details.inFavorites : t.details.addToFavorites}
          </span>
        </button>
      </div>
    </div>
  );
};
