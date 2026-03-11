import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MoodButton } from './MoodButton';
import { MovieCard } from '../swipe/MovieCard';
import { useMovieStore } from '../../store/movieStore';
import { useFavoritesStore } from '../../store/favoritesStore';
import { movieService } from '../../services/movieService';
import { useLanguage } from '../../hooks/useLanguage';
import type { Movie } from '../../types/movie';
import './MoodSelector.css';

// Маппинг настроений на иконки
const MOOD_ICONS: Record<string, string> = {
  'light-positive': '😊',
  'romance': '💕',
  'energize': '⚡',
  'relax': '😌',
  'emotional': '😢',
  'comedy': '😂',
  'philosophical': '🤔',
  'adrenaline': '🔥',
  'cozy': '🏠',
  'nostalgia': '📼',
  'horror': '😱',
  'fantasy': '🌟'
};

const MOODS = [
  'light-positive',
  'romance',
  'energize',
  'relax',
  'emotional',
  'comedy',
  'philosophical',
  'adrenaline',
  'cozy',
  'nostalgia',
  'horror',
  'fantasy'
] as const;

// Ключи для sessionStorage
const STORAGE_KEYS = {
  SELECTED_MOODS: 'moodSelector_selectedMoods',
  SELECTED_MOVIE: 'moodSelector_selectedMovie'
};

export const MoodSelector: React.FC = () => {
  const navigate = useNavigate();
  const movies = useMovieStore((state) => state.movies);
  const addFavorite = useFavoritesStore((state) => state.addFavorite);
  const { t } = useLanguage();
  
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  // Восстановление состояния при монтировании
  useEffect(() => {
    try {
      const savedMoods = sessionStorage.getItem(STORAGE_KEYS.SELECTED_MOODS);
      const savedMovie = sessionStorage.getItem(STORAGE_KEYS.SELECTED_MOVIE);
      
      if (savedMoods) {
        setSelectedMoods(JSON.parse(savedMoods));
      }
      
      if (savedMovie) {
        setSelectedMovie(JSON.parse(savedMovie));
      }
    } catch (error) {
      console.error('Ошибка восстановления состояния настроения:', error);
    }
  }, []);

  // Сохранение состояния при изменении
  useEffect(() => {
    try {
      if (selectedMoods.length > 0) {
        sessionStorage.setItem(STORAGE_KEYS.SELECTED_MOODS, JSON.stringify(selectedMoods));
      } else {
        sessionStorage.removeItem(STORAGE_KEYS.SELECTED_MOODS);
      }
    } catch (error) {
      console.error('Ошибка сохранения настроений:', error);
    }
  }, [selectedMoods]);

  useEffect(() => {
    try {
      if (selectedMovie) {
        sessionStorage.setItem(STORAGE_KEYS.SELECTED_MOVIE, JSON.stringify(selectedMovie));
      } else {
        sessionStorage.removeItem(STORAGE_KEYS.SELECTED_MOVIE);
      }
    } catch (error) {
      console.error('Ошибка сохранения фильма:', error);
    }
  }, [selectedMovie]);

  const handleMoodToggle = (mood: string) => {
    setShowValidation(false);
    setSelectedMovie(null);
    
    if (selectedMoods.includes(mood)) {
      setSelectedMoods(selectedMoods.filter(m => m !== mood));
    } else {
      setSelectedMoods([...selectedMoods, mood]);
    }
  };

  const handleSelectMovie = () => {
    if (selectedMoods.length === 0) {
      setShowValidation(true);
      return;
    }

    // Фильтруем фильмы по выбранным настроениям
    const filteredMovies = movieService.filterByMoods(movies, selectedMoods);
    
    if (filteredMovies.length === 0) {
      setShowValidation(true);
      return;
    }

    // Выбираем случайный фильм
    const randomMovie = movieService.getRandomMovie(filteredMovies);
    setSelectedMovie(randomMovie);
    setShowValidation(false);
  };

  const handleAddToFavorites = async () => {
    if (selectedMovie) {
      await addFavorite(selectedMovie.id);
    }
  };

  const handleViewDetails = () => {
    if (selectedMovie) {
      navigate(`/details/${selectedMovie.id}`);
    }
  };

  const handleReset = () => {
    setSelectedMovie(null);
    setSelectedMoods([]);
    setShowValidation(false);
  };

  return (
    <div className="mood-selector">
      <div className="mood-selector-header">
        <h2 className="mood-selector-title">{t.mood.title}</h2>
        <p className="mood-selector-subtitle">
          {t.mood.subtitle}
        </p>
      </div>

      {!selectedMovie ? (
        <>
          <div className="mood-selector-grid">
            {MOODS.map((mood) => (
              <MoodButton
                key={mood}
                label={t.moods[mood]}
                icon={MOOD_ICONS[mood]}
                selected={selectedMoods.includes(mood)}
                onClick={() => handleMoodToggle(mood)}
              />
            ))}
          </div>

          {showValidation && (
            <div className="mood-selector-validation">
              {selectedMoods.length === 0 
                ? t.mood.selectAtLeastOne
                : t.mood.noMoviesFound
              }
            </div>
          )}

          <div className="mood-selector-actions">
            <button
              className="mood-selector-button mood-selector-button--primary"
              onClick={handleSelectMovie}
              disabled={selectedMoods.length === 0}
            >
              {t.mood.selectMovie}
            </button>
            
            {selectedMoods.length > 0 && (
              <button
                className="mood-selector-button mood-selector-button--secondary"
                onClick={handleReset}
              >
                {t.mood.reset}
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="mood-selector-result">
          <h3 className="mood-selector-result-title">{t.mood.weSelected}</h3>
          
          <div className="mood-selector-result-card">
            <MovieCard movie={selectedMovie} onClick={handleViewDetails} />
          </div>

          <div className="mood-selector-result-actions">
            <button
              className="mood-selector-button mood-selector-button--primary"
              onClick={handleAddToFavorites}
            >
              {t.mood.addToFavorites}
            </button>
            
            <button
              className="mood-selector-button mood-selector-button--secondary"
              onClick={handleViewDetails}
            >
              {t.mood.moreDetails}
            </button>
            
            <button
              className="mood-selector-button mood-selector-button--secondary"
              onClick={handleSelectMovie}
            >
              {t.mood.anotherMovie}
            </button>
            
            <button
              className="mood-selector-button mood-selector-button--secondary"
              onClick={handleReset}
            >
              {t.mood.backToSelection}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
