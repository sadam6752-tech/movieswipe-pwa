import React from 'react';
import './SwipeControls.css';

interface SwipeControlsProps {
  onLike: () => void;
  onDislike: () => void;
  onUndo: () => void;
  canUndo: boolean;
}

export const SwipeControls: React.FC<SwipeControlsProps> = ({
  onLike,
  onDislike,
  onUndo,
  canUndo
}) => {
  return (
    <div className="swipe-controls">
      <button
        className="swipe-control swipe-control--dislike"
        onClick={onDislike}
        aria-label="Дизлайк"
        title="Дизлайк"
      >
        <span className="swipe-control-icon">👎</span>
        <span className="swipe-control-label">Дизлайк</span>
      </button>

      <button
        className="swipe-control swipe-control--undo"
        onClick={onUndo}
        disabled={!canUndo}
        aria-label="Отменить"
        title="Отменить"
      >
        <span className="swipe-control-icon">↩️</span>
        <span className="swipe-control-label">Отменить</span>
      </button>

      <button
        className="swipe-control swipe-control--like"
        onClick={onLike}
        aria-label="Лайк"
        title="Лайк"
      >
        <span className="swipe-control-icon">👍</span>
        <span className="swipe-control-label">Лайк</span>
      </button>
    </div>
  );
};
