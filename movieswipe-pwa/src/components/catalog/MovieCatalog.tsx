import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMovieStore } from '../../store/movieStore';
import { useSettingsStore } from '../../store/settingsStore';
import { movieService } from '../../services/movieService';
import { useGenreLoader } from '../../hooks/useGenreLoader';
import { useLanguage } from '../../hooks/useLanguage';
import type { Genre, MovieFilters, ContentType } from '../../types/movie';
import { SearchBar } from './SearchBar';
import { FilterPanel } from './FilterPanel';
import { CatalogGrid } from './CatalogGrid';
import { LoadingSpinner } from '../common/LoadingSpinner';
import './MovieCatalog.css';

export const MovieCatalog: React.FC = () => {
  const navigate = useNavigate();
  const { movies, isLoading } = useMovieStore();
  const { showAdultContent, contentTypeFilters } = useSettingsStore();
  const { t } = useLanguage();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Загружаем фильтры из sessionStorage или используем дефолтные
  const [filters, setFilters] = useState<MovieFilters>(() => {
    const saved = sessionStorage.getItem('movieCatalogFilters');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Добавляем contentTypes если его нет (для обратной совместимости)
        return {
          genres: parsed.genres || [],
          countries: parsed.countries || [],
          contentTypes: parsed.contentTypes || [],
          ratingMin: parsed.ratingMin ?? 0,
          ratingMax: parsed.ratingMax ?? 10,
          yearMin: parsed.yearMin ?? 1900,
          yearMax: parsed.yearMax ?? new Date().getFullYear(),
          moods: parsed.moods || []
        };
      } catch (e) {
        console.error('Failed to parse saved filters:', e);
      }
    }
    return {
      genres: [],
      countries: [],
      contentTypes: [],
      ratingMin: 0,
      ratingMax: 10,
      yearMin: 1900,
      yearMax: new Date().getFullYear(),
      moods: []
    };
  });

  // Сохраняем фильтры в sessionStorage при изменении
  React.useEffect(() => {
    sessionStorage.setItem('movieCatalogFilters', JSON.stringify(filters));
  }, [filters]);

  // Восстанавливаем состояние поиска и показа фильтров
  React.useEffect(() => {
    const savedSearch = sessionStorage.getItem('movieCatalogSearch');
    const savedShowFilters = sessionStorage.getItem('movieCatalogShowFilters');
    
    if (savedSearch) {
      setSearchQuery(savedSearch);
    }
    if (savedShowFilters) {
      setShowFilters(savedShowFilters === 'true');
    }
  }, []);

  // Сохраняем состояние поиска
  React.useEffect(() => {
    sessionStorage.setItem('movieCatalogSearch', searchQuery);
  }, [searchQuery]);

  // Сохраняем состояние показа фильтров
  React.useEffect(() => {
    sessionStorage.setItem('movieCatalogShowFilters', String(showFilters));
  }, [showFilters]);

  // Auto-load genres when filters change
  const { isLoading: isLoadingGenres, error: genreLoadError } = useGenreLoader(filters.genres);

  // Filter and search movies (synchronous version)
  const filteredMovies = useMemo(() => {
    let result = movies;

    // Фильтруем эротику если showAdultContent = false
    if (!showAdultContent) {
      result = result.filter(movie => !movie.genres.includes('erotic'));
    }

    // Фильтруем по типам контента
    if (!contentTypeFilters.showMovies || !contentTypeFilters.showSeries) {
      result = result.filter(movie => {
        const contentType = movie.contentType || 'movie';
        
        // Фильмы
        if (contentType === 'movie' && !contentTypeFilters.showMovies) {
          return false;
        }
        
        // Сериалы (включая все типы сериалов)
        if (['tv-series', 'animated-series'].includes(contentType) && !contentTypeFilters.showSeries) {
          return false;
        }
        
        // Мультфильмы, аниме, ТВ-шоу, концерты считаем как фильмы
        if (['cartoon', 'anime', 'tv-show', 'concert'].includes(contentType) && !contentTypeFilters.showMovies) {
          return false;
        }
        
        return true;
      });
    }

    // Apply search (synchronous client-side search)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(movie => 
        movie.title?.toLowerCase().includes(query) ||
        movie.originalTitle?.toLowerCase().includes(query) ||
        movie.director?.toLowerCase().includes(query) ||
        movie.cast?.some(actor => actor?.toLowerCase().includes(query))
      );
    }

    // Apply filters
    result = movieService.filterMovies(result, filters);

    return result;
  }, [movies, searchQuery, filters, showAdultContent, contentTypeFilters]);

  const handleMovieClick = (movieId: string) => {
    navigate(`/details/${movieId}`);
  };

  const handleGenresChange = (genres: Genre[]) => {
    setFilters({ ...filters, genres });
  };

  const handleCountriesChange = (countries: string[]) => {
    setFilters({ ...filters, countries });
  };

  const handleContentTypesChange = (contentTypes: ContentType[]) => {
    setFilters({ ...filters, contentTypes });
  };

  const handleMoodsChange = (moods: string[]) => {
    setFilters({ ...filters, moods });
  };

  const handleRatingChange = (range: [number, number]) => {
    setFilters({ ...filters, ratingMin: range[0], ratingMax: range[1] });
  };

  const handleYearChange = (range: [number, number]) => {
    setFilters({ ...filters, yearMin: range[0], yearMax: range[1] });
  };

  const handleResetFilters = () => {
    setFilters({
      genres: [],
      countries: [],
      contentTypes: [],
      ratingMin: 0,
      ratingMax: 10,
      yearMin: 1900,
      yearMax: new Date().getFullYear(),
      moods: []
    });
  };

  const hasActiveFilters = 
    filters.genres.length > 0 || 
    filters.countries.length > 0 ||
    filters.contentTypes.length > 0 ||
    filters.moods.length > 0 || 
    filters.ratingMin > 0 || 
    filters.ratingMax < 10 ||
    filters.yearMin > 1900 ||
    filters.yearMax < new Date().getFullYear();

  if (isLoading) {
    return (
      <div className="movie-catalog">
        <div className="movie-catalog-loading">
          <LoadingSpinner text={t.common.loading} />
        </div>
      </div>
    );
  }

  return (
    <div className="movie-catalog">
      <div className="movie-catalog-header">
        <h1 className="movie-catalog-title">{t.catalog.title}</h1>
        
        <div className="movie-catalog-search">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
          />
        </div>

        <div className="movie-catalog-controls">
          <button
            className={`movie-catalog-filter-toggle ${showFilters ? 'active' : ''} ${hasActiveFilters ? 'has-filters' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <span>🎬</span>
            <span>{t.catalog.filters}</span>
            {hasActiveFilters && <span className="filter-badge">●</span>}
          </button>
          
          <div className="movie-catalog-count">
            {t.catalog.title}: {filteredMovies.length}
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="movie-catalog-filters">
          <FilterPanel
            selectedGenres={filters.genres}
            selectedCountries={filters.countries}
            selectedContentTypes={filters.contentTypes}
            selectedMoods={filters.moods}
            ratingRange={[filters.ratingMin, filters.ratingMax]}
            yearRange={[filters.yearMin, filters.yearMax]}
            onGenresChange={handleGenresChange}
            onCountriesChange={handleCountriesChange}
            onContentTypesChange={handleContentTypesChange}
            onMoodsChange={handleMoodsChange}
            onRatingChange={handleRatingChange}
            onYearChange={handleYearChange}
            onReset={handleResetFilters}
          />
        </div>
      )}

      {isLoadingGenres && (
        <div className="movie-catalog-genre-loading">
          <LoadingSpinner size="small" />
          <span>{t.common.loading}</span>
        </div>
      )}

      {genreLoadError && (
        <div className="movie-catalog-genre-error">
          ⚠️ {genreLoadError}
        </div>
      )}

      <div className="movie-catalog-content">
        {filteredMovies.length === 0 ? (
          <div className="movie-catalog-empty">
            <div className="movie-catalog-empty-icon">🎬</div>
            <h2 className="movie-catalog-empty-title">{t.common.noResults}</h2>
            <p className="movie-catalog-empty-text">
              {t.catalog.noMovies}
            </p>
          </div>
        ) : (
          <CatalogGrid
            movies={filteredMovies}
            onMovieClick={handleMovieClick}
          />
        )}
      </div>
    </div>
  );
};
