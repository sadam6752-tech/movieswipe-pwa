#!/usr/bin/env node

/**
 * Миграция: добавление поля countries к существующим фильмам
 */

const fs = require('fs');
const path = require('path');

const FILES_TO_MIGRATE = [
  path.join(__dirname, '../public/data/movies.json'),
  path.join(__dirname, '../public/data/movies-poiskkino.json')
];

function migrateFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`⏭️  Пропускаем ${path.basename(filePath)} - файл не существует`);
    return;
  }

  console.log(`\n📝 Обработка ${path.basename(filePath)}...`);

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    
    let movies;
    let isArrayFormat = false;
    
    // Проверяем формат файла
    if (Array.isArray(data)) {
      movies = data;
      isArrayFormat = true;
    } else if (data.movies && Array.isArray(data.movies)) {
      movies = data.movies;
    } else {
      console.log('⚠️  Неверный формат файла');
      return;
    }

    let updated = 0;
    let skipped = 0;

    movies.forEach(movie => {
      if (!movie.countries) {
        movie.countries = ['Другие'];
        updated++;
      } else {
        skipped++;
      }
    });

    // Сохраняем обновленный файл
    const outputData = isArrayFormat ? movies : data;
    fs.writeFileSync(filePath, JSON.stringify(outputData, null, 2), 'utf8');

    console.log(`✅ Обновлено: ${updated} фильмов`);
    console.log(`⏭️  Пропущено: ${skipped} фильмов (уже имеют countries)`);
    console.log(`📊 Всего фильмов: ${movies.length}`);

  } catch (error) {
    console.error(`❌ Ошибка обработки файла:`, error.message);
  }
}

console.log('🚀 Миграция: добавление поля countries');
console.log('=' .repeat(50));

FILES_TO_MIGRATE.forEach(migrateFile);

console.log('\n✨ Миграция завершена!');
