# Руководство по интеграции с ПоискКино API

## Обзор

ПоискКино API предоставляет доступ к базе данных из 1,085,549 фильмов и сериалов, агрегируя данные из:
- Кинопоиск (рейтинги, описания на русском)
- TMDb (постеры, метаданные)
- IMDb (международные рейтинги)

**Бесплатный тариф:** 200 запросов в сутки

## Получение API ключа

1. Перейдите на https://poiskkino.dev/
2. Нажмите "Получить API"
3. Следуйте инструкциям в Telegram боте @poiskkinodev_bot
4. Скопируйте ваш API ключ

## Инкрементальная синхронизация

### Концепция

Скрипт `poiskkino-sync.cjs` реализует умную загрузку фильмов:

1. **Фильтры качества:**
   - Рейтинг > 6.0
   - Минимум 1000 голосов (популярные фильмы)
   - Обязательно наличие постера
   - Только фильмы (не сериалы)

2. **Временная стратегия:**
   - Начинаем с последних 5 лет
   - После загрузки расширяем на 5 лет назад
   - Продолжаем до 1900 года

3. **Сортировка:**
   - По количеству голосов (убывание)
   - Сначала самые популярные фильмы

4. **Прогресс:**
   - Сохраняется в `.sync-progress.json`
   - Можно остановить и продолжить в любой момент
   - Автоматически отслеживает дневной лимит

### Использование скрипта

#### Первый запуск

\`\`\`bash
cd movieswipe-pwa/scripts
node poiskkino-sync.cjs --api-key YOUR_API_KEY
\`\`\`

Скрипт загрузит до 200 фильмов (1 запрос = до 250 фильмов).

#### Ограничение запросов

Загрузить только 10 порций (2500 фильмов):

\`\`\`bash
node poiskkino-sync.cjs --api-key YOUR_API_KEY --max-requests 10
\`\`\`

#### Проверка статуса

\`\`\`bash
node poiskkino-sync.cjs --status
\`\`\`

Вывод:
\`\`\`
📊 Статус синхронизации:
  Всего загружено: 5000 фильмов
  Запросов сегодня: 20/200
  Последний запрос: 2026-03-07
  Период: 2016-2026
  Статус: В процессе...
\`\`\`

#### Сброс прогресса

Начать синхронизацию заново:

\`\`\`bash
node poiskkino-sync.cjs --reset
\`\`\`

### Автоматизация

#### Ежедневный запуск (cron)

Добавьте в crontab:

\`\`\`bash
# Запускать каждый день в 3:00 утра
0 3 * * * cd /path/to/movieswipe-pwa/scripts && node poiskkino-sync.cjs --api-key YOUR_KEY >> sync.log 2>&1
\`\`\`

#### GitHub Actions

Создайте `.github/workflows/sync-movies.yml`:

\`\`\`yaml
name: Sync Movies from ПоискКино

on:
  schedule:
    # Запускать каждый день в 3:00 UTC
    - cron: '0 3 * * *'
  workflow_dispatch: # Ручной запуск

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Run sync script
        env:
          POISKKINO_API_KEY: \${{ secrets.POISKKINO_API_KEY }}
        run: |
          cd movieswipe-pwa/scripts
          node poiskkino-sync.cjs --api-key $POISKKINO_API_KEY --max-requests 200
      
      - name: Commit and push if changed
        run: |
          git config --global user.name 'GitHub Actions'
          git config --global user.email 'actions@github.com'
          git add movieswipe-pwa/public/data/movies-poiskkino.json
          git add movieswipe-pwa/scripts/.sync-progress.json
          git diff --quiet && git diff --staged --quiet || (git commit -m "Update movies database" && git push)
\`\`\`

Не забудьте добавить секрет `POISKKINO_API_KEY` в настройках репозитория.

## Структура данных

### API Response (ПоискКино)

\`\`\`json
{
  "docs": [
    {
      "id": 666,
      "name": "Название фильма",
      "enName": "Movie Title",
      "alternativeName": "Alternative Title",
      "year": 2020,
      "description": "Описание фильма",
      "shortDescription": "Краткое описание",
      "rating": {
        "kp": 7.5,
        "imdb": 8.0,
        "tmdb": 7.8
      },
      "votes": {
        "kp": 50000,
        "imdb": 100000
      },
      "movieLength": 120,
      "genres": [
        { "name": "драма" },
        { "name": "триллер" }
      ],
      "poster": {
        "url": "https://...",
        "previewUrl": "https://..."
      },
      "backdrop": {
        "url": "https://..."
      },
      "persons": [
        {
          "id": 123,
          "name": "Режиссер",
          "enName": "Director",
          "enProfession": "director"
        },
        {
          "id": 456,
          "name": "Актер",
          "enName": "Actor",
          "enProfession": "actor"
        }
      ]
    }
  ],
  "total": 50000,
  "limit": 250,
  "next": "cursor_string",
  "hasNext": true
}
\`\`\`

### Наш формат (Movie)

\`\`\`typescript
{
  id: "kp-666",
  title: "Название фильма",
  originalTitle: "Movie Title",
  year: 2020,
  description: "Описание фильма",
  genres: ["drama", "thriller"],
  moods: ["emotional", "adrenaline"],
  rating: 7.5,
  duration: 120,
  director: "Режиссер",
  cast: ["Актер 1", "Актер 2"],
  poster: "https://...",
  backdrop: "https://...",
  language: "ru",
  source: "kinopoisk",
  isFavorite: false,
  watchStatus: "unwatched",
  createdAt: "2026-03-07T...",
  updatedAt: "2026-03-07T..."
}
\`\`\`

## Маппинг жанров

| ПоискКино | Наш формат |
|-----------|------------|
| боевик | action |
| приключения | adventure |
| мультфильм | animation |
| аниме | animation |
| комедия | comedy |
| детектив | detective |
| документальный | documentary |
| драма | drama |
| семейный | family |
| фэнтези | fantasy |
| история | historical |
| ужасы | horror |
| мюзикл | musical |
| мелодрама | romance |
| фантастика | sci-fi |
| триллер | thriller |
| военный | war |
| биография | biography |

## Использование в приложении

### Загрузка из локального файла

После запуска скрипта синхронизации, фильмы сохраняются в `public/data/movies-poiskkino.json`.

В настройках приложения:

1. Откройте "Настройки" → "Источники данных"
2. Включите "Кинопоиск"
3. Нажмите "Обновить каталог"

Приложение загрузит фильмы из локального JSON файла в IndexedDB.

### Проверка данных

\`\`\`bash
# Проверить размер файла
ls -lh movieswipe-pwa/public/data/movies-poiskkino.json

# Посмотреть количество фильмов
cat movieswipe-pwa/public/data/movies-poiskkino.json | jq '.movies | length'

# Посмотреть первый фильм
cat movieswipe-pwa/public/data/movies-poiskkino.json | jq '.movies[0]'
\`\`\`

## Оптимизация

### Размер файла

При загрузке большого количества фильмов (50,000+), файл может стать очень большим (>50MB).

**Решение:** Разделить на несколько файлов по жанрам (как в `GENRE_LOADING.md`).

### Кэширование

Все загруженные фильмы кэшируются в IndexedDB, поэтому:
- Работают офлайн
- Быстрый доступ
- Не требуют повторной загрузки

## Лимиты и ограничения

| Параметр | Значение |
|----------|----------|
| Запросов в день (бесплатно) | 200 |
| Фильмов за запрос | до 250 |
| Максимум фильмов в день | ~50,000 |
| Сброс лимита | Каждый день в 00:00 UTC |

## Обработка ошибок

### 401 Unauthorized
API ключ неверный или не передан.

**Решение:** Проверьте API ключ.

### 403 Forbidden
Превышен дневной лимит.

**Решение:** Дождитесь сброса лимита (следующий день).

### 404 Not Found
Фильм не найден.

**Решение:** Проверьте ID фильма.

### 400 Bad Request
Неверные параметры запроса.

**Решение:** Проверьте формат параметров (см. документацию API).

## Полезные ссылки

- Официальный сайт: https://poiskkino.dev/
- Документация API: https://poiskkino.dev/documentation
- Telegram бот: @poiskkinodev_bot
- База данных: 1,085,549 фильмов и сериалов

## Примеры запросов

### Поиск по рейтингу

\`\`\`bash
curl -X GET "https://api.kinopoisk.dev/v1.5/movie?rating.kp=7-10&limit=10" \\
  -H "X-API-KEY: YOUR_KEY"
\`\`\`

### Поиск по году

\`\`\`bash
curl -X GET "https://api.kinopoisk.dev/v1.5/movie?year=2020-2024&limit=10" \\
  -H "X-API-KEY: YOUR_KEY"
\`\`\`

### Поиск по жанру

\`\`\`bash
curl -X GET "https://api.kinopoisk.dev/v1.5/movie?genres.name=комедия&limit=10" \\
  -H "X-API-KEY: YOUR_KEY"
\`\`\`

### Получение конкретного фильма

\`\`\`bash
curl -X GET "https://api.kinopoisk.dev/v1.4/movie/666" \\
  -H "X-API-KEY: YOUR_KEY"
\`\`\`

## Заключение

Интеграция с ПоискКино API позволяет:
- ✅ Загружать реальную базу фильмов (1M+)
- ✅ Получать данные на русском языке
- ✅ Использовать качественные постеры
- ✅ Работать с популярными фильмами
- ✅ Инкрементально обновлять базу
- ✅ Работать офлайн после загрузки

Бесплатного тарифа (200 запросов/день) достаточно для загрузки 50,000 фильмов в день!
