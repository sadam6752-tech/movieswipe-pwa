// Типы для фильмов и связанных сущностей

export type ContentType = 
  | 'movie'           // Фильмы
  | 'tv-series'       // Сериалы
  | 'cartoon'         // Мультфильмы
  | 'anime'           // Аниме
  | 'animated-series' // Мультсериалы
  | 'tv-show'         // ТВ-шоу
  | 'concert';        // Концерт

export type Genre = 
  | 'action' | 'adventure' | 'biography'
  | 'comedy' | 'crime' | 'detective' | 'documentary'
  | 'drama' | 'erotic' | 'family' | 'fantasy' | 'historical'
  | 'horror' | 'kids' | 'comic' | 'melodrama' | 'music'
  | 'musical' | 'mystery' | 'noir' | 'reality' | 'romance'
  | 'sci-fi' | 'short' | 'sport' | 'talk-show' | 'thriller'
  | 'war' | 'western';

export type Country = 
  | 'США' | 'Россия' | 'Франция' | 'Великобритания' | 'Германия'
  | 'Италия' | 'Испания' | 'Япония' | 'Южная Корея' | 'Индия'
  | 'Другие';

export type WatchStatus = 'unwatched' | 'watching' | 'watched';
export type DataSource = 'imdb' | 'kinopoisk' | 'local';

export interface Movie {
  id: string;                    // Уникальный идентификатор
  title: string;                 // Название на русском
  originalTitle: string;         // Оригинальное название
  year: number;                  // Год выпуска
  description: string;           // Описание/синопсис
  contentType: ContentType;      // Тип контента
  genres: Genre[];               // Жанры
  moods: string[];               // Настроения
  countries: string[];           // Страны производства
  rating: number;                // Рейтинг (0-10)
  duration: number;              // Длительность в минутах
  director: string;              // Режиссер
  cast: string[];                // Актеры (топ-5)
  poster: string;                // URL постера
  backdrop: string;              // URL фонового изображения
  language: string;              // Язык (ru, en)
  isFavorite: boolean;           // Флаг избранного
  watchStatus: WatchStatus;      // Статус просмотра
  source: DataSource;            // Источник данных
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
}

export interface FavoriteMovie {
  movieId: string;               // ID фильма
  addedAt: string;               // ISO 8601 timestamp
  note?: string;                 // Заметка пользователя (опционально)
}

export interface MovieFilters {
  genres: Genre[];
  countries: string[];
  contentTypes: ContentType[];
  ratingMin: number;
  ratingMax: number;
  yearMin: number;
  yearMax: number;
  moods: string[];
}

export type SortOption = 'date' | 'title' | 'rating';
