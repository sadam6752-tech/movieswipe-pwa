import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Layout } from './components/common/Layout';
import { Navigation } from './components/common/Navigation';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { SwipeInterface } from './components/swipe/SwipeInterface';
import { MoodSelector } from './components/mood/MoodSelector';
import { FavoritesList } from './components/favorites/FavoritesList';
import { MovieDetails } from './components/details/MovieDetails';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { MovieCatalog } from './components/catalog/MovieCatalog';
import { InstallPrompt } from './components/common/InstallPrompt';
import { useSettingsStore } from './store/settingsStore';
import { useMovieStore } from './store/movieStore';
import { useUIStore } from './store/uiStore';
import { syncService } from './services/syncService';
import './App.css';

function App() {
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const loadMovies = useMovieStore((state) => state.loadMovies);
  const isLoading = useMovieStore((state) => state.isLoading);
  const { isOffline } = useUIStore();

  useEffect(() => {
    // Загружаем настройки при старте
    loadSettings();

    // Инициализируем данные
    const initData = async () => {
      await syncService.initializeData();
      await loadMovies();
    };

    initData();
  }, [loadSettings, loadMovies]);

  // Автоматическая синхронизация при восстановлении соединения
  useEffect(() => {
    if (!isOffline) {
      const syncOnReconnect = async () => {
        console.log('🔄 Syncing data after reconnection...');
        try {
          await syncService.initializeData();
          await loadMovies();
          console.log('✅ Sync completed');
        } catch (error) {
          console.error('❌ Sync failed:', error);
        }
      };

      // Небольшая задержка чтобы убедиться что соединение стабильно
      const timer = setTimeout(syncOnReconnect, 1000);
      return () => clearTimeout(timer);
    }
  }, [isOffline, loadMovies]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg-primary)'
      }}>
        <LoadingSpinner text="Загрузка фильмов..." />
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Layout>
          <OfflineIndicator />
          <InstallPrompt />
          <Routes>
            <Route path="/" element={<SwipeInterface />} />
            <Route path="/mood" element={<MoodSelector />} />
            <Route path="/catalog" element={<MovieCatalog />} />
            <Route path="/favorites" element={<FavoritesList />} />
            <Route path="/details/:id" element={<MovieDetails />} />
            <Route path="/settings" element={<SettingsPanel />} />
          </Routes>
          <Navigation />
        </Layout>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
