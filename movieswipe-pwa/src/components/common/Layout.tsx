import React from 'react';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <header className="layout-header">
        <h1 className="layout-title">MovieSwipe</h1>
      </header>
      
      <main className="layout-main">
        {children}
      </main>
    </div>
  );
};
