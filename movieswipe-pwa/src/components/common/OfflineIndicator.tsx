import React, { useEffect, useState } from 'react';
import { useUIStore } from '../../store/uiStore';
import './OfflineIndicator.css';

export const OfflineIndicator: React.FC = () => {
  const isOffline = useUIStore((state) => state.isOffline);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isOffline) {
      setShow(true);
    } else {
      // Delay hiding to show "back online" message briefly
      const timer = setTimeout(() => setShow(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOffline]);

  if (!show) return null;

  return (
    <div className={`offline-indicator ${isOffline ? 'offline-indicator--offline' : 'offline-indicator--online'}`}>
      <span className="offline-indicator-icon">
        {isOffline ? '📡' : '✅'}
      </span>
      <span className="offline-indicator-text">
        {isOffline ? 'Нет подключения к интернету' : 'Подключение восстановлено'}
      </span>
    </div>
  );
};
