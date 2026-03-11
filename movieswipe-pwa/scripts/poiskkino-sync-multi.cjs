#!/usr/bin/env node

/**
 * ПоискКино Multi-Key Sync
 * 
 * Автоматически переключается между несколькими API ключами
 * 
 * Использование:
 *   node poiskkino-sync-multi.cjs KEY1,KEY2,KEY3
 *   node poiskkino-sync-multi.cjs KEY1 KEY2 KEY3
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Получаем аргументы
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('❌ Ошибка: Нужно указать хотя бы один API ключ\n');
  console.log('Использование:');
  console.log('  node poiskkino-sync-multi.cjs KEY1,KEY2,KEY3');
  console.log('  node poiskkino-sync-multi.cjs KEY1 KEY2 KEY3\n');
  console.log('Примеры:');
  console.log('  node poiskkino-sync-multi.cjs ABC123,XYZ789');
  console.log('  node poiskkino-sync-multi.cjs ABC123 XYZ789 DEF456\n');
  process.exit(1);
}

// Парсим ключи (поддерживаем оба формата: через запятую и через пробел)
let apiKeys = [];
if (args.length === 1 && args[0].includes(',')) {
  // Формат: KEY1,KEY2,KEY3
  apiKeys = args[0].split(',').map(k => k.trim()).filter(k => k);
} else {
  // Формат: KEY1 KEY2 KEY3
  apiKeys = args.map(k => k.trim()).filter(k => k);
}

if (apiKeys.length === 0) {
  console.error('❌ Ошибка: Не удалось распарсить API ключи\n');
  process.exit(1);
}

console.log('🚀 ПоискКино Multi-Key Sync');
console.log('=' .repeat(60));
console.log(`📋 Найдено API ключей: ${apiKeys.length}`);
apiKeys.forEach((key, i) => {
  const masked = key.substring(0, 4) + '...' + key.substring(key.length - 4);
  console.log(`   ${i + 1}. ${masked}`);
});
console.log('=' .repeat(60));
console.log('');

const syncScript = path.join(__dirname, 'poiskkino-sync.cjs');
const progressFile = path.join(__dirname, '.sync-progress.json');

let totalMoviesLoaded = 0;
let totalRequestsUsed = 0;
let currentKeyIndex = 0;

// Функция для получения текущего прогресса
function getProgress() {
  try {
    if (fs.existsSync(progressFile)) {
      return JSON.parse(fs.readFileSync(progressFile, 'utf8'));
    }
  } catch (error) {
    console.error('⚠️  Ошибка чтения прогресса:', error.message);
  }
  return null;
}

// Функция для запуска синхронизации с одним ключом
function syncWithKey(apiKey, keyIndex) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔑 Используем API ключ #${keyIndex + 1}`);
  console.log(`${'='.repeat(60)}\n`);

  const progressBefore = getProgress();
  const moviesBefore = progressBefore ? progressBefore.totalMovies : 0;

  try {
    // Запускаем синхронизацию
    execSync(`node "${syncScript}" "${apiKey}"`, {
      stdio: 'inherit',
      cwd: __dirname
    });

    const progressAfter = getProgress();
    const moviesAfter = progressAfter ? progressAfter.totalMovies : 0;
    const moviesAdded = moviesAfter - moviesBefore;
    const requestsUsed = progressAfter ? progressAfter.requestsToday : 0;

    totalMoviesLoaded += moviesAdded;
    totalRequestsUsed += requestsUsed;

    console.log(`\n✅ Ключ #${keyIndex + 1} завершен:`);
    console.log(`   Загружено: ${moviesAdded} фильмов`);
    console.log(`   Запросов: ${requestsUsed}/200`);

    // Проверяем, нужно ли продолжать
    if (progressAfter && progressAfter.completed) {
      console.log('\n🎉 Синхронизация полностью завершена!');
      return 'completed';
    }

    if (requestsUsed >= 200) {
      console.log(`   Лимит исчерпан, переключаемся на следующий ключ...`);
      return 'limit_reached';
    }

    return 'success';

  } catch (error) {
    console.error(`\n❌ Ошибка при работе с ключом #${keyIndex + 1}`);
    
    // Проверяем прогресс после ошибки
    const progressAfter = getProgress();
    if (progressAfter && progressAfter.requestsToday >= 200) {
      console.log(`   Лимит исчерпан, переключаемся на следующий ключ...`);
      return 'limit_reached';
    }
    
    return 'error';
  }
}

// Главный цикл
async function main() {
  const startTime = Date.now();

  for (let i = 0; i < apiKeys.length; i++) {
    currentKeyIndex = i;
    const result = syncWithKey(apiKeys[i], i);

    if (result === 'completed') {
      break;
    }

    if (result === 'error' && i === apiKeys.length - 1) {
      console.log('\n⚠️  Все ключи использованы, но синхронизация не завершена');
      break;
    }

    // Небольшая пауза между ключами
    if (i < apiKeys.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  const endTime = Date.now();
  const duration = Math.round((endTime - startTime) / 1000);
  const minutes = Math.floor(duration / 60);
  const seconds = duration % 60;

  // Финальная статистика
  const finalProgress = getProgress();
  
  console.log('\n' + '='.repeat(60));
  console.log('📊 ИТОГОВАЯ СТАТИСТИКА');
  console.log('='.repeat(60));
  console.log(`⏱️  Время работы: ${minutes}м ${seconds}с`);
  console.log(`🔑 Использовано ключей: ${currentKeyIndex + 1} из ${apiKeys.length}`);
  console.log(`📊 Всего фильмов в базе: ${finalProgress ? finalProgress.totalMovies : 0}`);
  console.log(`📈 Загружено за сессию: ${totalMoviesLoaded}`);
  console.log(`🎯 Период: ${finalProgress ? finalProgress.yearRange.start : '?'}-${finalProgress ? finalProgress.yearRange.end : '?'}`);
  console.log(`✅ Статус: ${finalProgress && finalProgress.completed ? 'Завершено' : 'В процессе'}`);
  console.log('='.repeat(60));
  
  if (finalProgress && !finalProgress.completed && currentKeyIndex === apiKeys.length - 1) {
    console.log('\n💡 Подсказка: Для продолжения загрузки:');
    console.log('   1. Подожди до следующего дня');
    console.log('   2. Или добавь еще API ключей:');
    console.log(`      node poiskkino-sync-multi.cjs ${apiKeys.join(',')} NEW_KEY`);
  }
  
  console.log('');
}

main().catch(error => {
  console.error('\n❌ Критическая ошибка:', error.message);
  process.exit(1);
});
