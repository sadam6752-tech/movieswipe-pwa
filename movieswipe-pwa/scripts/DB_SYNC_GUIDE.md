# 🔄 Синхронизация базы данных между серверами

Руководство по переносу базы фильмов с одного сервера на другой.

## 📋 Сценарии использования

1. **Загрузили базу на Linux Mint** → хотите перенести на macOS
2. **Загрузили базу на macOS** → хотите перенести на Linux Mint
3. **Обновили базу на одном сервере** → хотите синхронизировать с другими

## 🚀 Быстрый старт

### На сервере-источнике (где есть база)

```bash
cd ~/apps/movieswipe-pwa/scripts
node export-db.cjs
```

Результат: файл `export/movieswipe-db-YYYY-MM-DD.json`

### На сервере-получателе (куда переносим)

```bash
# Скопируйте файл экспорта в папку scripts/export/
cd ~/apps/movieswipe-pwa/scripts
node import-db.cjs movieswipe-db-YYYY-MM-DD.json

# Пересоберите проект
cd ~/apps/movieswipe-pwa
npm run build

# Перезапустите сервер
sudo systemctl restart nginx  # или apache2
```

## 📤 Экспорт базы данных

### Команда

```bash
cd ~/apps/movieswipe-pwa/scripts
node export-db.cjs
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

### Пример вывода

```
📦 Экспорт базы данных...

✅ Найдено фильмов: 13526
✅ Прогресс синхронизации: 13526 фильмов, 200 запросов

✅ Экспорт завершён!
📁 Файл: /home/user/apps/movieswipe-pwa/scripts/export/movieswipe-db-2026-03-07T15-30-00.json
📊 Размер: 23.45 MB
🎬 Фильмов: 13526
📈 Запросов использовано: 200
📅 Последняя синхронизация: 07.03.2026, 15:30:00

📤 Для переноса на другой сервер:
   1. Скопируйте файл: movieswipe-db-2026-03-07T15-30-00.json
   2. На другом сервере запустите: node import-db.cjs movieswipe-db-2026-03-07T15-30-00.json
```

## 📥 Импорт базы данных

### Команда

```bash
cd ~/apps/movieswipe-pwa/scripts

# Вариант 1: Указать файл
node import-db.cjs movieswipe-db-2026-03-07T15-30-00.json

# Вариант 2: Использовать последний экспорт
node import-db.cjs
```

### Что происходит

1. ✅ Создаётся резервная копия текущей базы
2. ✅ Импортируются фильмы в `public/data/movies-poiskkino.json`
3. ✅ Импортируется прогресс в `.sync-progress.json`
4. ✅ Сохраняется статистика

### Пример вывода

```
📥 Импорт базы данных...

📁 Используется последний экспорт: movieswipe-db-2026-03-07T15-30-00.json
📖 Чтение файла: movieswipe-db-2026-03-07T15-30-00.json
✅ Найдено фильмов: 13526
📅 Дата экспорта: 07.03.2026, 15:30:00
💾 Создана резервная копия: movies-poiskkino-backup-1709821800000.json
✅ Фильмы импортированы: /home/user/apps/movieswipe-pwa/public/data/movies-poiskkino.json
✅ Прогресс синхронизации импортирован
   Запросов использовано: 200
   Последняя синхронизация: 07.03.2026, 15:30:00

✅ Импорт завершён успешно!
🎬 Всего фильмов: 13526

📝 Следующие шаги:
   1. Пересоберите проект: npm run build
   2. Перезапустите сервер: sudo systemctl restart nginx
   3. Откройте приложение в браузере
```

## 🔄 Способы переноса файла

### 1. USB флешка

```bash
# На сервере-источнике
cp ~/apps/movieswipe-pwa/scripts/export/movieswipe-db-*.json /media/usb/

# На сервере-получателе
cp /media/usb/movieswipe-db-*.json ~/apps/movieswipe-pwa/scripts/export/
```

### 2. SCP (через сеть)

```bash
# С Linux Mint на macOS
scp ~/apps/movieswipe-pwa/scripts/export/movieswipe-db-*.json user@mac-ip:~/apps/movieswipe-pwa/scripts/export/

# С macOS на Linux Mint
scp ~/apps/movieswipe-pwa/scripts/export/movieswipe-db-*.json user@linux-ip:~/apps/movieswipe-pwa/scripts/export/
```

### 3. Облачное хранилище

```bash
# Загрузите в Dropbox, Google Drive, OneDrive
# Затем скачайте на другом сервере
```

### 4. Git (если проект в репозитории)

```bash
# На сервере-источнике
cd ~/apps/movieswipe-pwa
git add scripts/export/movieswipe-db-*.json
git commit -m "Update database export"
git push

# На сервере-получателе
cd ~/apps/movieswipe-pwa
git pull
```

## 📊 Структура файла экспорта

```json
{
  "exportDate": "2026-03-07T15:30:00.000Z",
  "movies": [
    {
      "id": "kp-1",
      "title": "Название фильма",
      "year": 2024,
      ...
    }
  ],
  "progress": {
    "totalMovies": 13526,
    "requestsUsed": 200,
    "lastSync": "2026-03-07T15:30:00.000Z",
    ...
  },
  "stats": {
    "totalMovies": 13526,
    "requestsUsed": 200,
    "lastSync": "2026-03-07T15:30:00.000Z"
  }
}
```

## 🔒 Безопасность

### Резервные копии

Скрипт автоматически создаёт резервные копии:
- `movies-poiskkino-backup-TIMESTAMP.json`
- `.sync-progress-backup-TIMESTAMP.json`

### Восстановление из резервной копии

```bash
cd ~/apps/movieswipe-pwa/public/data

# Найдите резервную копию
ls -lh movies-poiskkino-backup-*.json

# Восстановите
cp movies-poiskkino-backup-1709821800000.json movies-poiskkino.json
```

## 💡 Полезные команды

```bash
# Посмотреть все экспорты
ls -lh ~/apps/movieswipe-pwa/scripts/export/

# Посмотреть размер базы
du -h ~/apps/movieswipe-pwa/public/data/movies-poiskkino.json

# Посмотреть количество фильмов
cat ~/apps/movieswipe-pwa/public/data/movies-poiskkino.json | grep -o '"id"' | wc -l

# Посмотреть прогресс синхронизации
cat ~/apps/movieswipe-pwa/scripts/.sync-progress.json

# Удалить старые экспорты (старше 7 дней)
find ~/apps/movieswipe-pwa/scripts/export/ -name "movieswipe-db-*.json" -mtime +7 -delete
```

## 🎯 Сценарии использования

### Сценарий 1: Первоначальная загрузка на Linux Mint

```bash
# 1. Загрузите базу
cd ~/apps/movieswipe-pwa/scripts
node poiskkino-sync.cjs --api-key YOUR_KEY

# 2. Экспортируйте
node export-db.cjs

# 3. Скопируйте файл на macOS
scp export/movieswipe-db-*.json user@mac:~/Downloads/

# 4. На macOS импортируйте
cd ~/apps/movieswipe-pwa/scripts
mkdir -p export
mv ~/Downloads/movieswipe-db-*.json export/
node import-db.cjs
npm run build
```

### Сценарий 2: Ежедневное обновление

```bash
# На основном сервере (где запускается синхронизация)
cd ~/apps/movieswipe-pwa/scripts
node poiskkino-sync.cjs --api-key YOUR_KEY
node export-db.cjs

# На других серверах
# Скопируйте файл и импортируйте
node import-db.cjs
npm run build
sudo systemctl restart nginx
```

### Сценарий 3: Автоматическая синхронизация через cron

На основном сервере:
```bash
# Добавьте в crontab
0 3 * * * cd ~/apps/movieswipe-pwa/scripts && node poiskkino-sync.cjs --api-key YOUR_KEY && node export-db.cjs
```

На других серверах (через scp):
```bash
# Добавьте в crontab
30 3 * * * scp user@main-server:~/apps/movieswipe-pwa/scripts/export/movieswipe-db-*.json ~/apps/movieswipe-pwa/scripts/export/ && cd ~/apps/movieswipe-pwa/scripts && node import-db.cjs && cd .. && npm run build && sudo systemctl restart nginx
```

## 🐛 Решение проблем

### Ошибка: "Файл не найден"

```bash
# Проверьте путь
ls -la ~/apps/movieswipe-pwa/scripts/export/

# Создайте папку export
mkdir -p ~/apps/movieswipe-pwa/scripts/export/
```

### Ошибка: "Неверный формат файла"

```bash
# Проверьте содержимое файла
head -20 ~/apps/movieswipe-pwa/scripts/export/movieswipe-db-*.json

# Файл должен начинаться с:
# {
#   "exportDate": "...",
#   "movies": [
```

### Ошибка: "Permission denied"

```bash
# Дайте права на выполнение
chmod +x ~/apps/movieswipe-pwa/scripts/export-db.cjs
chmod +x ~/apps/movieswipe-pwa/scripts/import-db.cjs

# Дайте права на запись
chmod 755 ~/apps/movieswipe-pwa/scripts/export/
chmod 755 ~/apps/movieswipe-pwa/public/data/
```

## 📚 Дополнительная информация

- **POISKKINO_GUIDE.md** - Работа с ПоискКино API
- **README.md** - Описание проекта
- **DEPLOY_LINUX.md** - Развёртывание на Linux Mint

---

**MovieSwipe PWA** | Синхронизация базы данных между серверами
