# 🐧 Развёртывание на Linux Mint

Полное руководство по установке и запуску MovieSwipe PWA на Linux Mint.

## 📋 Содержание

1. [Требования](#требования)
2. [Установка зависимостей](#установка-зависимостей)
3. [Распаковка и запуск](#распаковка-и-запуск)
4. [Развёртывание на Nginx](#развёртывание-на-nginx)
5. [Развёртывание на Apache](#развёртывание-на-apache)
6. [Автозапуск при загрузке](#автозапуск-при-загрузке)
7. [Обновление базы фильмов](#обновление-базы-фильмов)
8. [Решение проблем](#решение-проблем)

## 📦 Требования

- Linux Mint 20+ (или Ubuntu 20.04+)
- Node.js >= 18.0.0
- npm >= 9.0.0
- 500 MB свободного места

## 🔧 Установка зависимостей

### 1. Обновите систему

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Установите Node.js 18+

```bash
# Добавьте репозиторий NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -

# Установите Node.js и npm
sudo apt install -y nodejs

# Проверьте версии
node --version  # должно быть >= 18.0.0
npm --version   # должно быть >= 9.0.0
```

### 3. Установите дополнительные инструменты

```bash
# Git (если нужен)
sudo apt install -y git

# Build tools (для некоторых npm пакетов)
sudo apt install -y build-essential
```

## 🚀 Распаковка и запуск

### 1. Распакуйте архив

```bash
# Создайте директорию для проекта
mkdir -p ~/apps
cd ~/apps

# Распакуйте архив (укажите правильный путь к файлу)
tar -xzf movieswipe-pwa-linux.tar.gz

# Переименуйте папку (если нужно)
mv movieswipe-pwa movieswipe

# Перейдите в папку проекта
cd movieswipe
```

### 2. Установите зависимости

```bash
# Установите npm пакеты
npm install

# Это займёт 1-2 минуты
```

### 3. Запустите в режиме разработки

```bash
# Запустите dev-сервер
npm run dev

# Или с доступом из локальной сети
npm run dev -- --host 0.0.0.0
```

Откройте в браузере: **http://localhost:5173**

### 4. Соберите для продакшена

```bash
# Соберите проект
npm run build

# Результат будет в папке dist/
ls -lh dist/
```

## 🌐 Развёртывание на Nginx (рекомендуется)

### 1. Установите Nginx

```bash
sudo apt install -y nginx

# Проверьте статус
sudo systemctl status nginx
```

### 2. Соберите проект

```bash
cd ~/apps/movieswipe
npm run build
```

### 3. Создайте конфигурацию Nginx

```bash
sudo nano /etc/nginx/sites-available/movieswipe
```

Вставьте следующую конфигурацию:

```nginx
server {
    listen 80;
    server_name localhost;
    
    # Путь к собранному проекту
    root /home/YOUR_USERNAME/apps/movieswipe/dist;
    index index.html;
    
    # Логи
    access_log /var/log/nginx/movieswipe-access.log;
    error_log /var/log/nginx/movieswipe-error.log;
    
    # Поддержка React Router (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # Кэширование статических файлов
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Кэширование JSON данных
    location ~* \.json$ {
        expires 1d;
        add_header Cache-Control "public";
    }
    
    # Gzip сжатие
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;
}
```

**Важно:** Замените `YOUR_USERNAME` на ваше имя пользователя!

```bash
# Узнайте ваше имя пользователя
whoami
```

### 4. Активируйте конфигурацию

```bash
# Создайте символическую ссылку
sudo ln -s /etc/nginx/sites-available/movieswipe /etc/nginx/sites-enabled/

# Удалите дефолтную конфигурацию (опционально)
sudo rm /etc/nginx/sites-enabled/default

# Проверьте конфигурацию
sudo nginx -t

# Перезапустите Nginx
sudo systemctl restart nginx
```

### 5. Настройте права доступа

```bash
# Дайте Nginx доступ к файлам
chmod 755 ~/apps
chmod 755 ~/apps/movieswipe
chmod -R 755 ~/apps/movieswipe/dist
```

### 6. Откройте в браузере

```
http://localhost
```

Или с другого устройства в локальной сети:

```
http://IP_АДРЕС_СЕРВЕРА
```

Узнайте IP адрес:
```bash
hostname -I | awk '{print $1}'
```

## 🔥 Развёртывание на Apache (альтернатива)

### 1. Установите Apache

```bash
sudo apt install -y apache2

# Включите необходимые модули
sudo a2enmod rewrite
sudo a2enmod headers
sudo a2enmod deflate
```

### 2. Соберите проект

```bash
cd ~/apps/movieswipe
npm run build
```

### 3. Создайте конфигурацию Apache

```bash
sudo nano /etc/apache2/sites-available/movieswipe.conf
```

Вставьте:

```apache
<VirtualHost *:80>
    ServerName localhost
    DocumentRoot /home/YOUR_USERNAME/apps/movieswipe/dist
    
    <Directory /home/YOUR_USERNAME/apps/movieswipe/dist>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
        
        # Поддержка React Router
        RewriteEngine On
        RewriteBase /
        RewriteRule ^index\.html$ - [L]
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteCond %{REQUEST_FILENAME} !-d
        RewriteRule . /index.html [L]
    </Directory>
    
    # Кэширование
    <FilesMatch "\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$">
        Header set Cache-Control "max-age=31536000, public, immutable"
    </FilesMatch>
    
    # Gzip сжатие
    <IfModule mod_deflate.c>
        AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
    </IfModule>
    
    ErrorLog ${APACHE_LOG_DIR}/movieswipe-error.log
    CustomLog ${APACHE_LOG_DIR}/movieswipe-access.log combined
</VirtualHost>
```

**Важно:** Замените `YOUR_USERNAME` на ваше имя пользователя!

### 4. Активируйте конфигурацию

```bash
# Активируйте сайт
sudo a2ensite movieswipe.conf

# Деактивируйте дефолтный сайт (опционально)
sudo a2dissite 000-default.conf

# Проверьте конфигурацию
sudo apache2ctl configtest

# Перезапустите Apache
sudo systemctl restart apache2
```

### 5. Настройте права доступа

```bash
chmod 755 ~/apps
chmod 755 ~/apps/movieswipe
chmod -R 755 ~/apps/movieswipe/dist
```

### 6. Откройте в браузере

```
http://localhost
```

## 🔄 Автозапуск при загрузке системы

### Nginx

```bash
# Включите автозапуск
sudo systemctl enable nginx

# Проверьте статус
sudo systemctl status nginx
```

### Apache

```bash
# Включите автозапуск
sudo systemctl enable apache2

# Проверьте статус
sudo systemctl status apache2
```

## 📊 Обновление базы фильмов

### 1. Получите API ключ ПоискКино

1. Перейдите на [poiskkino.dev](https://poiskkino.dev/)
2. Нажмите "Получить API"
3. Следуйте инструкциям в Telegram боте @poiskkinodev_bot

### 2. Запустите синхронизацию

```bash
cd ~/apps/movieswipe/scripts

# Первый запуск
node poiskkino-sync.cjs --api-key YOUR_API_KEY

# Проверьте статус
node poiskkino-sync.cjs --status

# Ограничьте количество запросов
node poiskkino-sync.cjs --api-key YOUR_KEY --max-requests 50
```

### 3. Пересоберите проект

```bash
cd ~/apps/movieswipe
npm run build

# Перезапустите веб-сервер
sudo systemctl restart nginx
# или
sudo systemctl restart apache2
```

### 4. Автоматическая синхронизация (cron)

```bash
# Откройте crontab
crontab -e

# Добавьте задачу (каждый день в 3:00)
0 3 * * * cd /home/YOUR_USERNAME/apps/movieswipe/scripts && node poiskkino-sync.cjs --api-key YOUR_KEY >> sync.log 2>&1

# Добавьте задачу пересборки (каждый день в 3:30)
30 3 * * * cd /home/YOUR_USERNAME/apps/movieswipe && npm run build && sudo systemctl restart nginx >> build.log 2>&1
```

**Важно:** Замените `YOUR_USERNAME` и `YOUR_KEY`!

Для выполнения `sudo` без пароля в cron:

```bash
# Откройте sudoers
sudo visudo

# Добавьте в конец файла
YOUR_USERNAME ALL=(ALL) NOPASSWD: /bin/systemctl restart nginx
YOUR_USERNAME ALL=(ALL) NOPASSWD: /bin/systemctl restart apache2
```

## 🐛 Решение проблем

### Ошибка: "Cannot find module"

```bash
cd ~/apps/movieswipe
rm -rf node_modules package-lock.json
npm install
```

### Ошибка: "Permission denied"

```bash
# Исправьте права доступа
chmod 755 ~/apps
chmod 755 ~/apps/movieswipe
chmod -R 755 ~/apps/movieswipe/dist

# Для Nginx
sudo chown -R www-data:www-data ~/apps/movieswipe/dist

# Для Apache
sudo chown -R www-data:www-data ~/apps/movieswipe/dist
```

### Nginx не запускается

```bash
# Проверьте конфигурацию
sudo nginx -t

# Проверьте логи
sudo tail -f /var/log/nginx/error.log

# Проверьте, не занят ли порт 80
sudo netstat -tulpn | grep :80

# Остановите другой сервис на порту 80
sudo systemctl stop apache2
```

### Apache не запускается

```bash
# Проверьте конфигурацию
sudo apache2ctl configtest

# Проверьте логи
sudo tail -f /var/log/apache2/error.log

# Проверьте порт
sudo netstat -tulpn | grep :80

# Остановите Nginx если запущен
sudo systemctl stop nginx
```

### Приложение не открывается (403 Forbidden)

```bash
# Проверьте права доступа
ls -la ~/apps/movieswipe/dist

# Исправьте права
chmod -R 755 ~/apps/movieswipe/dist

# Проверьте путь в конфигурации
sudo nano /etc/nginx/sites-available/movieswipe
# или
sudo nano /etc/apache2/sites-available/movieswipe.conf
```

### Приложение не открывается (404 Not Found)

```bash
# Проверьте, что проект собран
ls ~/apps/movieswipe/dist/index.html

# Если файла нет, соберите проект
cd ~/apps/movieswipe
npm run build
```

### Не работает React Router (404 на /catalog, /favorites)

Убедитесь, что в конфигурации Nginx/Apache есть правило `try_files` или `RewriteRule` для SPA.

### Не загружаются фильмы

```bash
# Проверьте, что файл существует
ls -lh ~/apps/movieswipe/dist/data/movies-poiskkino.json

# Проверьте размер файла (должен быть ~23 MB)
du -h ~/apps/movieswipe/dist/data/movies-poiskkino.json
```

## 📱 Доступ из локальной сети

### 1. Узнайте IP адрес сервера

```bash
hostname -I | awk '{print $1}'
# Например: 192.168.1.100
```

### 2. Настройте firewall (если включен)

```bash
# Разрешите HTTP трафик
sudo ufw allow 80/tcp

# Проверьте статус
sudo ufw status
```

### 3. Откройте на другом устройстве

```
http://192.168.1.100
```

## 🔒 Настройка HTTPS (опционально)

### Для локальной сети (самоподписанный сертификат)

```bash
# Создайте сертификат
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/movieswipe.key \
  -out /etc/ssl/certs/movieswipe.crt

# Обновите конфигурацию Nginx
sudo nano /etc/nginx/sites-available/movieswipe
```

Добавьте:

```nginx
server {
    listen 443 ssl;
    server_name localhost;
    
    ssl_certificate /etc/ssl/certs/movieswipe.crt;
    ssl_certificate_key /etc/ssl/private/movieswipe.key;
    
    # ... остальная конфигурация
}

# Редирект с HTTP на HTTPS
server {
    listen 80;
    server_name localhost;
    return 301 https://$server_name$request_uri;
}
```

```bash
# Перезапустите Nginx
sudo systemctl restart nginx
```

## 💡 Полезные команды

```bash
# Управление Nginx
sudo systemctl start nginx      # Запустить
sudo systemctl stop nginx       # Остановить
sudo systemctl restart nginx    # Перезапустить
sudo systemctl status nginx     # Статус
sudo nginx -t                   # Проверить конфигурацию

# Управление Apache
sudo systemctl start apache2    # Запустить
sudo systemctl stop apache2     # Остановить
sudo systemctl restart apache2  # Перезапустить
sudo systemctl status apache2   # Статус
sudo apache2ctl configtest      # Проверить конфигурацию

# Логи
sudo tail -f /var/log/nginx/movieswipe-access.log
sudo tail -f /var/log/nginx/movieswipe-error.log
sudo tail -f /var/log/apache2/movieswipe-access.log
sudo tail -f /var/log/apache2/movieswipe-error.log

# Проект
cd ~/apps/movieswipe
npm run dev                     # Dev-сервер
npm run build                   # Сборка
npm run preview                 # Предпросмотр сборки

# Синхронизация
cd ~/apps/movieswipe/scripts
node poiskkino-sync.cjs --status
node poiskkino-sync.cjs --api-key KEY
```

## 🎉 Готово!

Ваше приложение MovieSwipe PWA запущено на Linux Mint!

**Быстрый старт:**
```bash
tar -xzf movieswipe-pwa-deploy.tar.gz
cd movieswipe-pwa
npm install
npm run build
sudo apt install nginx
# Настройте Nginx (см. выше)
```

Откройте **http://localhost** и наслаждайтесь! 🍿

## 📚 Дополнительная документация

- **README.md** - Описание проекта
- **DEPLOYMENT.md** - Деплой на облачные платформы
- **POISKKINO_GUIDE.md** - Работа с ПоискКино API
- **CHANGELOG.md** - История изменений
