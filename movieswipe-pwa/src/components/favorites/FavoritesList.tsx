import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFavoritesStore } from '../../store/favoritesStore';
import { useLanguage } from '../../hooks/useLanguage';
import type { SortOption } from '../../types/movie';
import { FavoriteItem } from './FavoriteItem';
import { FavoritesGrid } from './FavoritesGrid';
import { LoadingSpinner } from '../common/LoadingSpinner';
import './FavoritesList.css';

type ViewMode = 'list' | 'grid';

export const FavoritesList: React.FC = () => {
  const navigate = useNavigate();
  const { favorites, sortBy, isLoading, loadFavorites, removeFavorite, setSortBy } = useFavoritesStore();
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value as SortOption);
  };

  const handleRemove = async (movieId: string) => {
    await removeFavorite(movieId);
  };

  const handleClick = (movieId: string) => {
    navigate(`/details/${movieId}`);
  };

  if (isLoading) {
    return (
      <div className="favorites-list">
        <div className="favorites-list-loading">
          <LoadingSpinner text={t.common.loading} />
        </div>
      </div>
    );
  }

  return (
    <div className="favorites-list">
      <div className="favorites-list-header">
        <h1 className="favorites-list-title">{t.favorites.title}</h1>
        
        {favorites.length > 0 && (
          <div className="favorites-list-controls">
            <div className="favorites-list-sort">
              <label htmlFor="sort-select" className="favorites-list-sort-label">
                {t.common.sort}:
              </label>
              <select
                id="sort-select"
                className="favorites-list-sort-select"
                value={sortBy}
                onChange={handleSortChange}
              >
                <option value="date">{t.favorites.sortByDate}</option>
                <option value="title">{t.favorites.sortByTitle}</option>
                <option value="rating">{t.favorites.sortByRating}</option>
              </select>
            </div>

            <div className="favorites-list-view-toggle">
              <button
                className={`favorites-list-view-button ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                aria-label="Список"
              >
                ☰
              </button>
              <button
                className={`favorites-list-view-button ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                aria-label="Сетка"
              >
                ⊞
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="favorites-list-content">
        {favorites.length === 0 ? (
          <div className="favorites-list-empty">
            <div className="favorites-list-empty-icon">💔</div>
            <h2 className="favorites-list-empty-title">{t.favorites.empty}</h2>
            <p className="favorites-list-empty-text">
              {t.swipe.swipeRight}
            </p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="favorites-list-items">
            {favorites.map((movie) => (
              <FavoriteItem
                key={movie.id}
                movie={movie}
                onRemove={handleRemove}
                onClick={handleClick}
              />
            ))}
          </div>
        ) : (
          <FavoritesGrid
            movies={favorites}
            onRemove={handleRemove}
            onClick={handleClick}
          />
        )}
      </div>
    </div>
  );
};
