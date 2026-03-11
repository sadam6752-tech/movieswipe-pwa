import React, { useState } from 'react';
import { useSwipeable } from 'react-swipeable';
import { useNavigate } from 'react-router-dom';
import { MovieCard } from './MovieCard';
import { SwipeControls } from './SwipeControls';
import { useMovieStore } from '../../store/movieStore';
import { useFavoritesStore } from '../../store/favoritesStore';
import { useLanguage } from '../../hooks/useLanguage';
import './SwipeAnimation.css';
import './SwipeInterface.css';

export const SwipeInterface: React.FC = () => {
  const navigate = useNavigate();
  const movies = useMovieStore((state) => state.movies);
  const currentIndex = useMovieStore((state) => state.currentIndex);
  const history = useMovieStore((state) => state.history);
  const nextMovie = useMovieStore((state) => state.nextMovie);
  const previousMovie = useMovieStore((state) => state.previousMovie);
  const shuffleMovies = useMovieStore((state) => state.shuffleMovies);
  const addToHistory = useMovieStore((state) => state.addToHistory);
  const addFavorite = useFavoritesStore((state) => state.addFavorite);
  const { t } = useLanguage();

  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const currentMovie = movies[currentIndex];
  const hasMoreMovies = currentIndex < movies.length - 1;
  const canUndo = history.length > 0;

  const handleSwipeRight = async () => {
    if (!currentMovie || isAnimating) return;

    setIsAnimating(true);
    setSwipeDirection('right');

    // Добавляем в избранное
    await addFavorite(currentMovie.id);
    
    // Добавляем в историю
    addToHistory(currentMovie);

    // Переходим к следующему фильму после анимации
    setTimeout(() => {
      nextMovie();
      setSwipeDirection(null);
      setIsAnimating(false);
    }, 300);
  };

  const handleSwipeLeft = () => {
    if (!currentMovie || isAnimating) return;

    setIsAnimating(true);
    setSwipeDirection('left');

    // Добавляем в историю
    addToHistory(currentMovie);

    // Переходим к следующему фильму после анимации
    setTimeout(() => {
      nextMovie();
      setSwipeDirection(null);
      setIsAnimating(false);
    }, 300);
  };

  const handleUndo = () => {
    if (!canUndo || isAnimating) return;
    previousMovie();
  };

  const handleCardClick = () => {
    if (currentMovie && !isAnimating) {
      navigate(`/details/${currentMovie.id}`);
    }
  };

  // Swipeable handlers
  const swipeHandlers = useSwipeable({
    onSwipedLeft: handleSwipeLeft,
    onSwipedRight: handleSwipeRight,
    trackMouse: true,
    preventScrollOnSwipe: true,
    delta: 50
  });

  // Показываем до 3 карточек в стеке
  const visibleMovies = movies.slice(currentIndex, currentIndex + 3);

  if (movies.length === 0) {
    return (
      <div className="swipe-interface-empty">
        <p>{t.swipe.noMovies}</p>
      </div>
    );
  }

  if (!hasMoreMovies && currentIndex >= movies.length) {
    return (
      <div className="swipe-interface-empty">
        <h2>🎉 {t.swipe.title}</h2>
        <p>{t.swipe.noMovies}</p>
        <button 
          className="swipe-interface-reset"
          onClick={() => shuffleMovies()}
        >
          {t.mood.reset}
        </button>
      </div>
    );
  }

  return (
    <div className="swipe-interface">
      <div className="swipe-interface-stack" {...swipeHandlers}>
        {visibleMovies.map((movie, index) => {
          const isTop = index === 0;
          const stackClass = `swipe-card--stack-${index}`;
          const animationClass = isTop && swipeDirection 
            ? `swipe-card--${swipeDirection} swipe-card--animating`
            : '';

          return (
            <div
              key={movie.id}
              className={`swipe-card ${stackClass} ${animationClass}`}
            >
              <MovieCard
                movie={movie}
                onClick={isTop ? handleCardClick : undefined}
              />
              
              {isTop && swipeDirection && (
                <div className={`swipe-indicator swipe-indicator--${swipeDirection === 'right' ? 'like' : 'dislike'} swipe-indicator--visible`}>
                  {swipeDirection === 'right' ? 'ЛАЙК' : 'ПРОПУСК'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <SwipeControls
        onLike={handleSwipeRight}
        onDislike={handleSwipeLeft}
        onUndo={handleUndo}
        canUndo={canUndo}
      />

      <div className="swipe-interface-counter">
        {currentIndex + 1} / {movies.length}
      </div>
    </div>
  );
};
