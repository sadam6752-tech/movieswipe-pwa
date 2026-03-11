import type { Genre } from '../types/movie';
import type { Mood, MoodMapping } from '../types/mood';
import { ALL_GENRES, GENRE_LABELS as GENRE_TRANSLATIONS } from './genres';

// 32 жанра (импортируем из genres.ts)
export const GENRES: Genre[] = ALL_GENRES;

// 12 настроений
export const MOODS: Mood[] = [
  'light-positive',
  'romance',
  'energize',
  'relax',
  'emotional',
  'comedy',
  'philosophical',
  'adrenaline',
  'cozy',
  'nostalgia',
  'horror',
  'fantasy'
];

// Маппинг настроений на жанры
export const MOOD_MAPPINGS: MoodMapping[] = [
  {
    mood: 'light-positive',
    label: 'Лёгкость и позитив',
    genres: ['comedy', 'family', 'animation'],
    ratingRange: [6.5, 10],
    keywords: ['fun', 'happy', 'uplifting']
  },
  {
    mood: 'romance',
    label: 'Романтика',
    genres: ['romance', 'drama'],
    ratingRange: [6.0, 10],
    keywords: ['love', 'romantic', 'relationship']
  },
  {
    mood: 'energize',
    label: 'Зарядиться энергией',
    genres: ['action', 'adventure', 'sci-fi', 'sport', 'music'],
    ratingRange: [6.5, 10],
    keywords: ['energy', 'dynamic', 'exciting']
  },
  {
    mood: 'relax',
    label: 'Расслабиться и отключиться',
    genres: ['comedy', 'family', 'animation'],
    ratingRange: [6.0, 10],
    keywords: ['relax', 'calm', 'easy']
  },
  {
    mood: 'emotional',
    label: 'Погрустить/попереживать',
    genres: ['drama', 'romance', 'biography'],
    ratingRange: [7.0, 10],
    keywords: ['emotional', 'touching', 'deep']
  },
  {
    mood: 'comedy',
    label: 'Посмеяться от души',
    genres: ['comedy'],
    ratingRange: [6.5, 10],
    keywords: ['funny', 'hilarious', 'laugh']
  },
  {
    mood: 'philosophical',
    label: 'Задуматься о жизни',
    genres: ['drama', 'sci-fi', 'biography'],
    ratingRange: [7.5, 10],
    keywords: ['philosophical', 'thoughtful', 'meaningful']
  },
  {
    mood: 'adrenaline',
    label: 'Почувствовать драйв/адреналин',
    genres: ['action', 'thriller', 'horror'],
    ratingRange: [6.5, 10],
    keywords: ['adrenaline', 'intense', 'thrilling']
  },
  {
    mood: 'cozy',
    label: 'Ощутить атмосферу уюта',
    genres: ['family', 'animation', 'comedy'],
    ratingRange: [6.0, 10],
    keywords: ['cozy', 'warm', 'comfortable']
  },
  {
    mood: 'nostalgia',
    label: 'Испытать ностальгию',
    genres: ['drama', 'historical', 'biography', 'western'],
    ratingRange: [7.0, 10],
    keywords: ['nostalgia', 'memories', 'past']
  },
  {
    mood: 'horror',
    label: 'Испугаться',
    genres: ['horror', 'thriller', 'mystery'],
    ratingRange: [6.0, 10],
    keywords: ['scary', 'frightening', 'suspense']
  },
  {
    mood: 'fantasy',
    label: 'Погрузиться в фантастику/другой мир',
    genres: ['fantasy', 'sci-fi', 'adventure'],
    ratingRange: [6.5, 10],
    keywords: ['fantasy', 'magical', 'otherworldly']
  }
];

// Названия жанров на русском (для обратной совместимости, используйте getGenreLabel из genres.ts)
export const GENRE_LABELS: Record<Genre, string> = Object.fromEntries(
  ALL_GENRES.map(genre => [genre, GENRE_TRANSLATIONS[genre].ru])
) as Record<Genre, string>;

// Названия настроений на русском
export const MOOD_LABELS: Record<string, string> = {
  'light-positive': 'Лёгкость и позитив',
  'romance': 'Романтика',
  'energize': 'Зарядиться энергией',
  'relax': 'Расслабиться',
  'emotional': 'Погрустить',
  'comedy': 'Посмеяться',
  'philosophical': 'Задуматься',
  'adrenaline': 'Драйв',
  'cozy': 'Уют',
  'nostalgia': 'Ностальгия',
  'horror': 'Испугаться',
  'fantasy': 'Фантастика'
};
