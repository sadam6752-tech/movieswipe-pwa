// Сервис для работы с LocalStorage

class StorageService {
  /**
   * Получить значение из LocalStorage
   */
  get<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return null;
      }
      return JSON.parse(item) as T;
    } catch (error) {
      console.error(`Error reading from localStorage (key: ${key}):`, error);
      return null;
    }
  }

  /**
   * Сохранить значение в LocalStorage
   */
  set<T>(key: string, value: T): boolean {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      // Обработка ошибки quota exceeded
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.error('LocalStorage quota exceeded. Attempting to clear old data...');
        this.clearOldData();
        
        // Повторная попытка после очистки
        try {
          const serialized = JSON.stringify(value);
          localStorage.setItem(key, serialized);
          return true;
        } catch (retryError) {
          console.error('Failed to save to localStorage after clearing:', retryError);
          return false;
        }
      }
      
      console.error(`Error writing to localStorage (key: ${key}):`, error);
      return false;
    }
  }

  /**
   * Удалить значение из LocalStorage
   */
  remove(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing from localStorage (key: ${key}):`, error);
    }
  }

  /**
   * Очистить все данные из LocalStorage
   */
  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing localStorage:', error);
    }
  }

  /**
   * Проверить существование ключа
   */
  has(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }

  /**
   * Получить все ключи
   */
  keys(): string[] {
    return Object.keys(localStorage);
  }

  /**
   * Очистить старые данные (вспомогательный метод для обработки quota exceeded)
   */
  private clearOldData(): void {
    // Удаляем временные данные и кэш
    const keysToRemove = this.keys().filter(key => 
      key.startsWith('temp_') || 
      key.startsWith('cache_')
    );
    
    keysToRemove.forEach(key => this.remove(key));
    
    console.log(`Cleared ${keysToRemove.length} old items from localStorage`);
  }
}

// Экспортируем singleton
export const storageService = new StorageService();
