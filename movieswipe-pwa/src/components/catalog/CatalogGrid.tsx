import React, { useState, useEffect } from 'react';
import type { Movie } from '../../types/movie';
import { CatalogItem } from './CatalogItem';
import './CatalogGrid.css';

interface CatalogGridProps {
  movies: Movie[];
  onMovieClick: (movieId: string) => void;
}

const MOVIES_PER_PAGE = 100; // Показываем по 100 фильмов за раз

export const CatalogGrid: React.FC<CatalogGridProps> = ({ movies, onMovieClick }) => {
  const [displayedCount, setDisplayedCount] = useState(MOVIES_PER_PAGE);

  // Сбрасываем счетчик при изменении списка фильмов
  useEffect(() => {
    setDisplayedCount(MOVIES_PER_PAGE);
  }, [movies]);

  const displayedMovies = movies.slice(0, displayedCount);
  const hasMore = displayedCount < movies.length;

  const loadMore = () => {
    setDisplayedCount(prev => Math.min(prev + MOVIES_PER_PAGE, movies.length));
  };

  return (
    <div className="catalog-grid-container">
      <div className="catalog-grid">
        {displayedMovies.map((movie) => (
          <CatalogItem
            key={movie.id}
            movie={movie}
            onClick={onMovieClick}
          />
        ))}
      </div>
      
      {hasMore && (
        <div className="catalog-load-more">
          <button 
            className="catalog-load-more-button"
            onClick={loadMore}
          >
            Показать ещё ({movies.length - displayedCount} фильмов)
          </button>
        </div>
      )}
    </div>
  );
};
