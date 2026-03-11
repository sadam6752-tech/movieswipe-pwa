// Типы для настроений

export type Mood = 
  | 'light-positive'
  | 'romance'
  | 'energize'
  | 'relax'
  | 'emotional'
  | 'comedy'
  | 'philosophical'
  | 'adrenaline'
  | 'cozy'
  | 'nostalgia'
  | 'horror'
  | 'fantasy';

export interface MoodMapping {
  mood: Mood;
  label: string;                 // Отображаемое название
  genres: string[];              // Связанные жанры
  ratingRange: [number, number]; // Диапазон рейтинга
  keywords: string[];            // Ключевые слова для поиска
}
