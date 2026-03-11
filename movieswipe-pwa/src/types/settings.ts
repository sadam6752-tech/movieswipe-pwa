// Типы для настроек приложения

import type { Genre } from './movie';
import type { Language } from '../i18n/translations';

export interface Settings {
  language: Language;            // Язык интерфейса (ru, en, de)
  theme: 'dark' | 'light';       // Тема оформления
  dataSources: {
    imdb: boolean;               // Использовать IMDB
    kinopoisk: boolean;          // Использовать Кинопоиск
  };
  tmdbApiKey?: string;           // API ключ для TMDB
  loadedGenres: Genre[];         // Загруженные жанры из локальных JSON
  lastSync: string;              // ISO 8601 timestamp последней синхронизации
  showAdultContent: boolean;     // Показывать контент 18+
  contentTypeFilters: {
    showMovies: boolean;         // Показывать фильмы
    showSeries: boolean;         // Показывать сериалы
  };
}
