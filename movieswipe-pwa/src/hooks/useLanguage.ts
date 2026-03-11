import { useSettingsStore } from '../store/settingsStore';
import { useTranslations } from '../i18n/translations';
import { getGenreLabel } from '../utils/genres';
import { getCountryLabel } from '../utils/countries';
import { getContentTypeLabel } from '../utils/contentTypes';
import type { Genre, Country, ContentType } from '../types/movie';

// Хук для получения текущего языка и переводов
export function useLanguage() {
  const language = useSettingsStore((state) => state.language);
  const t = useTranslations(language);
  
  // Функция для получения названия жанра
  const getGenreName = (genre: Genre) => getGenreLabel(genre, language);
  
  // Функция для получения названия страны
  const getCountryName = (country: Country) => getCountryLabel(country, language);
  
  // Функция для получения названия типа контента
  const getContentTypeName = (contentType: ContentType) => getContentTypeLabel(contentType, language);
  
  return {
    language,
    t,
    getGenreName,
    getCountryName,
    getContentTypeName
  };
}
