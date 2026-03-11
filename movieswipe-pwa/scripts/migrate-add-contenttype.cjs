#!/usr/bin/env node

/**
 * Migration Script: Add contentType field to existing movies
 * 
 * Этот скрипт добавляет поле contentType к существующим фильмам в movies-poiskkino.json
 * на основе их жанров и других характеристик.
 */

const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '../public/data/movies-poiskkino.json');
const BACKUP_FILE = path.join(__dirname, '../public/data/movies-poiskkino.backup-contenttype.json');

/**
 * Определить тип контента на основе жанров и других полей
 */
function determineContentType(movie) {
  // Если уже есть contentType - оставляем
  if (movie.contentType) {
    return movie.contentType;
  }

  const genres = movie.genres || [];
  
  // Проверяем жанры для определения типа
  if (genres.includes('anime')) {
    return 'anime';
  }
  
  // По умолчанию - фильм
  return 'movie';
}

/**
 * Главная функция миграции
 */
async function migrate() {
  console.log('🎬 Migration: Add contentType field');
  console.log('================================\n');

  // Проверяем существование файла
  if (!fs.existsSync(INPUT_FILE)) {
    console.error('❌ Файл не найден:', INPUT_FILE);
    console.log('💡 Запустите сначала poiskkino-sync.cjs для загрузки фильмов\n');
    process.exit(1);
  }

  try {
    // Загружаем данные
    console.log('📖 Загрузка данных из', INPUT_FILE);
    const data = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf8'));
    const movies = data.movies || [];
    
    console.log(`   Найдено фильмов: ${movies.length}\n`);

    // Создаем бэкап
    console.log('💾 Создание бэкапа...');
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(data, null, 2), 'utf8');
    console.log(`   Бэкап сохранен: ${BACKUP_FILE}\n`);

    // Обновляем фильмы
    console.log('🔄 Обновление фильмов...');
    let updatedCount = 0;
    
    movies.forEach((movie, index) => {
      const oldContentType = movie.contentType;
      const newContentType = determineContentType(movie);
      
      if (!oldContentType || oldContentType !== newContentType) {
        movie.contentType = newContentType;
        updatedCount++;
      }
      
      // Прогресс каждые 1000 фильмов
      if ((index + 1) % 1000 === 0) {
        console.log(`   Обработано: ${index + 1}/${movies.length}`);
      }
    });

    console.log(`\n✓ Обновлено фильмов: ${updatedCount}/${movies.length}\n`);

    // Сохраняем обновленные данные
    console.log('💾 Сохранение обновленных данных...');
    fs.writeFileSync(INPUT_FILE, JSON.stringify(data, null, 2), 'utf8');
    console.log(`   Сохранено: ${INPUT_FILE}\n`);

    console.log('================================');
    console.log('✓ Миграция завершена успешно!');
    console.log('================================\n');

  } catch (error) {
    console.error('\n❌ Ошибка миграции:', error.message);
    console.error('Восстановите данные из бэкапа:', BACKUP_FILE);
    process.exit(1);
  }
}

// CLI
if (require.main === module) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Использование: node migrate-add-contenttype.cjs

Добавляет поле contentType к существующим фильмам в movies-poiskkino.json.

Примеры:
  node migrate-add-contenttype.cjs
`);
    process.exit(0);
  }

  migrate().catch(error => {
    console.error('❌ Критическая ошибка:', error);
    process.exit(1);
  });
}

module.exports = { migrate };
