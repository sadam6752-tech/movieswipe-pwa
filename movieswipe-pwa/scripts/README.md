# Скрипты генерации данных

## generate-genre-files.js

Скрипт для автоматической генерации JSON файлов с фильмами по жанрам из TMDB API.

### Требования

- Node.js 14+
- TMDB API ключ ([получить здесь](https://www.themoviedb.org/settings/api))

### Установка

Скрипт использует только встроенные модули Node.js, дополнительная установка не требуется.

### Использование

#### Базовое использование

Генерация всех жанров (по 500 фильмов каждый):

```bash
TMDB_API_KEY=your_api_key_here node scripts/generate-genre-files.js
```

#### Только базовый файл

Генерация только `movies.json` с 100 популярными фильмами:

```bash
TMDB_API_KEY=your_api_key_here node scripts/generate-genre-files.js --base-only
```

#### Конкретный жанр

Генерация только одного жанра:

```bash
TMDB_API_KEY=your_api_key_here node scripts/generate-genre-files.js --genre=comedy
```

#### Кастомный лимит

Изменение количества фильмов на жанр:

```bash
TMDB_API_KEY=your_api_key_here node scripts/generate-genre-files.js --genre=action --limit=1000
```

### Параметры

- `--genre=GENRE` - генерировать только указанный жанр
- `--limit=NUMBER` - количество фильмов на жанр (по умолчанию: 500)
- `--base-only` - генерировать только базовый файл

### Доступные жанры

- `comedy` - Комедии
- `action` - Боевики
- `drama` - Драмы
- `sci-fi` - Фантастика
- `horror` - Ужасы
- `romance` - Романтика
- `thriller` - Триллеры
- `animation` - Анимация
- `adventure` - Приключения
- `family` - Семейные
- `fantasy` - Фэнтези
- `detective` - Детективы
- `documentary` - Документальные
- `historical` - Исторические
- `musical` - Музыкальные
- `war` - Военные

### Примеры

#### Генерация всех жанров

```bash
# Экспортируем API ключ
export TMDB_API_KEY=your_api_key_here

# Генерируем все жанры
node scripts/generate-genre-files.js
```

#### Генерация нескольких жанров

```bash
# Комедии
TMDB_API_KEY=your_key node scripts/generate-genre-files.js --genre=comedy

# Боевики
TMDB_API_KEY=your_key node scripts/generate-genre-files.js --genre=action

# Драмы
TMDB_API_KEY=your_key node scripts/generate-genre-files.js --genre=drama
```

#### Большая коллекция

```bash
# 1000 фильмов на жанр
TMDB_API_KEY=your_key node scripts/generate-genre-files.js --limit=1000
```

### Вывод

Скрипт создает файлы в `public/data/`:

```
public/data/
├── movies.json              # Базовая коллекция (100 фильмов)
├── movies-comedy.json       # 500 комедий
├── movies-action.json       # 500 боевиков
├── movies-drama.json        # 500 драм
└── ...
```

### Формат файлов

Каждый файл содержит:

```json
{
  "movies": [
    {
      "id": "comedy-12345",
      "title": "Название на русском",
      "originalTitle": "Original Title",
      "year": 2024,
      "description": "Описание на русском",
      "genres": ["comedy", "romance"],
      "moods": ["light-positive", "comedy"],
      "rating": 8.5,
      "duration": 120,
      "director": "Неизвестно",
      "cast": [],
      "poster": "https://image.tmdb.org/t/p/w500/...",
      "backdrop": "https://image.tmdb.org/t/p/w1280/...",
      "language": "ru",
      "isFavorite": false,
      "watchStatus": "unwatched",
      "source": "local",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### Особенности

#### Rate Limiting

Скрипт автоматически соблюдает лимиты TMDB API:
- 250ms задержка между запросами
- Максимум 40 запросов в 10 секунд

#### Дедупликация

Фильмы автоматически дедуплицируются по ID.

#### Маппинг жанров

TMDB жанры автоматически конвертируются в жанры приложения:
- Action (28) → action
- Comedy (35) → comedy
- Drama (18) → drama
- И т.д.

#### Генерация настроений

Настроения автоматически генерируются на основе жанров:
- comedy → ["comedy", "light-positive"]
- action → ["adrenaline", "energize"]
- drama → ["emotional", "philosophical"]

### Время выполнения

| Операция | Время |
|----------|-------|
| Базовый файл (100 фильмов) | ~30 сек |
| Один жанр (500 фильмов) | ~2-3 мин |
| Все жанры (16 × 500) | ~40-50 мин |

### Размеры файлов

| Файл | Фильмов | Размер |
|------|---------|--------|
| movies.json | 100 | ~108 KB |
| movies-comedy.json | 500 | ~540 KB |
| movies-action.json | 500 | ~540 KB |
| **Всего (все жанры)** | **8000+** | **~8.5 MB** |

### Обработка ошибок

Скрипт продолжает работу при ошибках:
- Пропускает недоступные страницы
- Логирует ошибки в консоль
- Сохраняет частичные результаты

### Обновление данных

Для обновления существующих файлов:

```bash
# Удалить старые файлы
rm public/data/movies-*.json

# Сгенерировать новые
TMDB_API_KEY=your_key node scripts/generate-genre-files.js
```

### Автоматизация

#### Cron job (ежедневное обновление)

```bash
# Добавить в crontab
0 2 * * * cd /path/to/project && TMDB_API_KEY=your_key node scripts/generate-genre-files.js
```

#### GitHub Actions

```yaml
name: Update Movie Data
on:
  schedule:
    - cron: '0 2 * * *'  # Каждый день в 2:00
  workflow_dispatch:

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - name: Generate files
        env:
          TMDB_API_KEY: ${{ secrets.TMDB_API_KEY }}
        run: node scripts/generate-genre-files.js
      - name: Commit changes
        run: |
          git config --local user.email "action@github.com"
          git config --local user.name "GitHub Action"
          git add public/data/*.json
          git commit -m "Update movie data" || exit 0
          git push
```

### Troubleshooting

#### "TMDB_API_KEY не установлен"

Убедитесь, что API ключ передан:

```bash
TMDB_API_KEY=your_key node scripts/generate-genre-files.js
```

#### "Нет результатов"

Проверьте:
- Правильность API ключа
- Интернет соединение
- Лимиты TMDB API

#### "Ошибка на странице X"

Обычно временная проблема. Скрипт продолжит со следующей страницы.

### Лицензия

MIT

### Поддержка

Если возникли проблемы, проверьте:
1. API ключ действителен
2. Есть интернет соединение
3. Не превышены лимиты TMDB API
4. Достаточно места на диске

Для получения помощи создайте issue в репозитории.


---

## poiskkino-sync.cjs

Скрипт для инкрементальной синхронизации с ПоискКино API - загрузка реальной базы фильмов из Кинопоиска, TMDb и IMDb.

### Требования

- Node.js 14+
- ПоискКино API ключ ([получить здесь](https://poiskkino.dev/))

### Особенности

- ✅ **Умные фильтры:** Рейтинг > 6.0, популярные фильмы, с постерами
- ✅ **Инкрементальная загрузка:** Можно остановить и продолжить в любой момент
- ✅ **Автоматический лимит:** Отслеживает 200 запросов/день
- ✅ **Временная стратегия:** Начинает с последних 5 лет, расширяется назад
- ✅ **Прогресс:** Сохраняется в `.sync-progress.json`

### Использование

#### Первый запуск

```bash
node scripts/poiskkino-sync.cjs --api-key YOUR_POISKKINO_KEY
```

Загрузит до 50,000 фильмов (200 запросов × 250 фильмов).

#### Ограничение запросов

```bash
# Только 10 запросов (до 2500 фильмов)
node scripts/poiskkino-sync.cjs --api-key YOUR_KEY --max-requests 10
```

#### Проверка статуса

```bash
node scripts/poiskkino-sync.cjs --status
```

Вывод:
```
📊 Статус синхронизации:
  Всего загружено: 5000 фильмов
  Запросов сегодня: 20/200
  Последний запрос: 2026-03-07
  Период: 2016-2026
  Статус: В процессе...
```

#### Сброс прогресса

```bash
node scripts/poiskkino-sync.cjs --reset
```

### Параметры

- `--api-key <key>` - ПоискКино API ключ (обязательно)
- `--max-requests <n>` - Максимум запросов за запуск
- `--status` - Показать текущий статус
- `--reset` - Сбросить прогресс и начать заново
- `-h, --help` - Показать справку

### Примеры

#### Ежедневная синхронизация

```bash
# Загружать каждый день до лимита
node scripts/poiskkino-sync.cjs --api-key YOUR_KEY
```

#### Постепенная загрузка

```bash
# День 1: 10 запросов
node scripts/poiskkino-sync.cjs --api-key YOUR_KEY --max-requests 10

# День 2: еще 10 запросов
node scripts/poiskkino-sync.cjs --api-key YOUR_KEY --max-requests 10

# И так далее...
```

### Вывод

Скрипт создает файл:

```
public/data/
└── movies-poiskkino.json    # База фильмов из ПоискКино
```

### Формат данных

```json
{
  "movies": [
    {
      "id": "kp-666",
      "title": "Название фильма",
      "originalTitle": "Original Title",
      "year": 2020,
      "description": "Описание на русском",
      "genres": ["drama", "thriller"],
      "moods": ["emotional", "adrenaline"],
      "rating": 7.5,
      "duration": 120,
      "director": "Режиссер",
      "cast": ["Актер 1", "Актер 2", "Актер 3"],
      "poster": "https://...",
      "backdrop": "https://...",
      "language": "ru",
      "source": "kinopoisk",
      "isFavorite": false,
      "watchStatus": "unwatched",
      "createdAt": "2026-03-07T...",
      "updatedAt": "2026-03-07T..."
    }
  ]
}
```

### Фильтры загрузки

| Параметр | Значение |
|----------|----------|
| Рейтинг КП | > 6.0 |
| Минимум голосов | 1000+ |
| Тип | Только фильмы |
| Постер | Обязательно |
| Сортировка | По популярности |

### Временная стратегия

1. **Фаза 1:** Последние 5 лет (2021-2026)
2. **Фаза 2:** 2016-2026
3. **Фаза 3:** 2011-2026
4. **Фаза N:** До 1900 года

### Прогресс (.sync-progress.json)

```json
{
  "lastCursor": "cursor_string",
  "totalMovies": 5000,
  "requestsToday": 20,
  "lastRequestDate": "2026-03-07",
  "yearRange": {
    "start": 2016,
    "end": 2026
  },
  "completed": false
}
```

### Лимиты

| Параметр | Значение |
|----------|----------|
| Запросов в день | 200 |
| Фильмов за запрос | до 250 |
| Максимум в день | ~50,000 |
| Сброс лимита | 00:00 UTC |

### Автоматизация

#### Cron (ежедневно)

```bash
# Добавить в crontab
0 3 * * * cd /path/to/project && node scripts/poiskkino-sync.cjs --api-key YOUR_KEY >> sync.log 2>&1
```

#### GitHub Actions

```yaml
name: Sync ПоискКино

on:
  schedule:
    - cron: '0 3 * * *'  # Каждый день в 3:00 UTC
  workflow_dispatch:

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Run sync
        env:
          POISKKINO_API_KEY: ${{ secrets.POISKKINO_API_KEY }}
        run: |
          cd scripts
          node poiskkino-sync.cjs --api-key $POISKKINO_API_KEY --max-requests 200
      
      - name: Commit changes
        run: |
          git config --global user.name 'GitHub Actions'
          git config --global user.email 'actions@github.com'
          git add public/data/movies-poiskkino.json
          git add scripts/.sync-progress.json
          git diff --quiet && git diff --staged --quiet || (git commit -m "Update ПоискКино database" && git push)
```

### Обработка ошибок

#### 401 Unauthorized
API ключ неверный.

**Решение:** Проверьте ключ на https://poiskkino.dev/

#### 403 Forbidden
Превышен дневной лимит.

**Решение:** Дождитесь следующего дня (сброс в 00:00 UTC).

#### 400 Bad Request
Неверные параметры.

**Решение:** Проверьте формат параметров.

### Время выполнения

| Операция | Запросов | Фильмов | Время |
|----------|----------|---------|-------|
| Первый запуск | 200 | ~50,000 | ~2-3 мин |
| Продолжение | 200 | ~50,000 | ~2-3 мин |
| Полная база | ~2000 | ~500,000 | 10 дней |

### Размеры файлов

| Фильмов | Размер файла |
|---------|--------------|
| 5,000 | ~5 MB |
| 50,000 | ~50 MB |
| 500,000 | ~500 MB |

### Сравнение с TMDB

| Параметр | TMDB | ПоискКино |
|----------|------|-----------|
| База | ~1M | 1,085,549 |
| Язык | EN | RU |
| Лимит | Нет | 200/день |
| Рейтинги | TMDB, IMDB | КП, IMDB, TMDB |
| Качество | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

### Troubleshooting

#### Файл прогресса поврежден

```bash
node scripts/poiskkino-sync.cjs --reset
```

#### Нет интернета

Скрипт сохранит прогресс и можно продолжить позже.

#### Медленная загрузка

Это нормально - скрипт соблюдает rate limits (500ms между запросами).

### Дополнительная информация

Подробное руководство: `../POISKKINO_GUIDE.md`

---

## Сравнение скриптов

| Параметр | generate-genre-files.js | poiskkino-sync.cjs |
|----------|-------------------------|-------------------|
| **Источник** | TMDB | ПоискКино (КП+TMDB+IMDB) |
| **Язык** | Английский | Русский |
| **Лимит** | Нет | 200 запросов/день |
| **Фильмов** | ~8,000 | ~500,000+ |
| **Время** | 40-50 мин | 10 дней (инкрементально) |
| **Размер** | ~8.5 MB | ~500 MB |
| **Прогресс** | Нет | Да (.sync-progress.json) |
| **Использование** | Разработка | Продакшен |

## Рекомендации

1. **Для разработки:** Используйте `generate-genre-files.js` (быстро, нет лимитов)
2. **Для продакшена:** Используйте `poiskkino-sync.cjs` (русский язык, больше данных)
3. **Гибридный подход:** Загрузите базу из ПоискКино, дополните TMDB при необходимости

## Получение API ключей

### TMDB
1. Регистрация: https://www.themoviedb.org/
2. Settings → API
3. Создать ключ (бесплатно)

### ПоискКино
1. Сайт: https://poiskkino.dev/
2. Нажать "Получить API"
3. Telegram бот: @poiskkinodev_bot

## Дополнительные ресурсы

- [TMDB Guide](../TMDB_GUIDE.md) - Подробное руководство по TMDB
- [ПоискКино Guide](../POISKKINO_GUIDE.md) - Подробное руководство по ПоискКино
- [Genre Loading](../GENRE_LOADING.md) - Система ленивой загрузки по жанрам
- [API Optimization](../API_OPTIMIZATION.md) - Оптимизация запросов к API


---

## export-db.cjs

Экспорт базы данных фильмов для переноса на другой сервер.

### Использование

```bash
node scripts/export-db.cjs
```

### Что экспортируется

- ✅ Все фильмы из `movies-poiskkino.json`
- ✅ Прогресс синхронизации (`.sync-progress.json`)
- ✅ Статистика (количество фильмов, запросов, дата)

### Результат

Файл создаётся в папке `scripts/export/`:
```
movieswipe-db-2026-03-07T15-30-00.json
```

---

## import-db.cjs

Импорт базы данных с другого сервера.

### Использование

```bash
# Указать файл
node scripts/import-db.cjs movieswipe-db-2026-03-07T15-30-00.json

# Использовать последний экспорт
node scripts/import-db.cjs
```

### Что происходит

1. ✅ Создаётся резервная копия текущей базы
2. ✅ Импортируются фильмы в `public/data/movies-poiskkino.json`
3. ✅ Импортируется прогресс в `.sync-progress.json`

---

## 🔄 Синхронизация между серверами

Полное руководство: [DB_SYNC_GUIDE.md](./DB_SYNC_GUIDE.md)

### Быстрый старт

**На сервере-источнике (где есть база):**
```bash
cd ~/apps/movieswipe-pwa/scripts
node export-db.cjs
# Скопируйте файл из export/ на другой сервер
```

**На сервере-получателе (куда переносим):**
```bash
cd ~/apps/movieswipe-pwa/scripts
node import-db.cjs movieswipe-db-YYYY-MM-DD.json
cd ..
npm run build
sudo systemctl restart nginx
```

### Способы переноса

1. **USB флешка** - скопируйте файл на флешку
2. **SCP** - `scp export/movieswipe-db-*.json user@server:~/`
3. **Облако** - Dropbox, Google Drive, OneDrive
4. **Git** - добавьте в репозиторий

Подробнее: [DB_SYNC_GUIDE.md](./DB_SYNC_GUIDE.md)
