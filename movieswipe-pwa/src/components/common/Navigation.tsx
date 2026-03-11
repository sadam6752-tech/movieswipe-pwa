import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../../hooks/useLanguage';
import './Navigation.css';

interface NavItem {
  path: string;
  labelKey: 'swipe' | 'mood' | 'catalog' | 'favorites' | 'settings';
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { path: '/', labelKey: 'swipe', icon: '🎬' },
  { path: '/mood', labelKey: 'mood', icon: '😊' },
  { path: '/catalog', labelKey: 'catalog', icon: '📚' },
  { path: '/favorites', labelKey: 'favorites', icon: '❤️' },
  { path: '/settings', labelKey: 'settings', icon: '⚙️' }
];

export const Navigation: React.FC = () => {
  const location = useLocation();
  const { t } = useLanguage();
  
  return (
    <nav className="navigation">
      {NAV_ITEMS.map((item) => {
        const isActive = location.pathname === item.path;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`navigation-item ${isActive ? 'navigation-item--active' : ''}`}
          >
            <span className="navigation-icon">{item.icon}</span>
            <span className="navigation-label">{t.nav[item.labelKey]}</span>
          </Link>
        );
      })}
    </nav>
  );
};
