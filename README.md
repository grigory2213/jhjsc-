# Task Manager Pro

Многофункциональное приложение для управления задачами с расширенными возможностями командной работы.

## Основные функции

- Система аутентификации с разделением прав (админ/пользователь)
- Создание задач администраторами
- Назначение задач на других пользователей
- Добавление геолокации к задачам
- Запись аудио-заметок к задачам

## Технический стек

### Frontend
- React + TypeScript
- TanStack Query для управления состоянием
- ShadcnUI + Tailwind для стилизации
- React Hook Form для форм
- Wouter для маршрутизации

### Backend
- Express.js
- Passport.js для аутентификации
- PostgreSQL + Drizzle ORM
- Express Session для сессий

## Структура базы данных

### Таблица users
```sql
- id: serial (PRIMARY KEY)
- username: text (UNIQUE)
- password: text
- isAdmin: boolean
```

### Таблица tasks
```sql
- id: serial (PRIMARY KEY)
- userId: integer (создатель задачи)
- assignedToId: integer (исполнитель)
- title: text
- description: text
- latitude: text (опционально)
- longitude: text (опционально)
- audioUrl: text (опционально)
```

## Основные компоненты

### Страницы
- `/auth` - Страница авторизации/регистрации
- `/` - Главная страница со списком задач
- `/tasks/:id` - Детальная страница задачи

### Серверные маршруты
- POST `/api/register` - Регистрация
- POST `/api/login` - Авторизация
- POST `/api/logout` - Выход
- GET `/api/user` - Получение текущего пользователя
- GET `/api/users` - Получение списка пользователей (только для админа)
- GET `/api/tasks` - Получение задач
- GET `/api/tasks/:id` - Получение конкретной задачи
- POST `/api/tasks` - Создание задачи (только для админа)
- PATCH `/api/tasks/:id` - Обновление задачи
- POST `/api/tasks/:id/audio` - Загрузка аудио
- DELETE `/api/tasks/:id` - Удаление задачи (только для админа)

## Права доступа

### Администратор
- Создание новых задач
- Назначение задач на пользователей
- Просмотр всех задач
- Удаление задач

### Обычный пользователь
- Просмотр назначенных ему задач
- Обновление информации по своим задачам
- Добавление геолокации и аудио к своим задачам

## Запуск проекта

1. Убедитесь, что у вас установлен Node.js и PostgreSQL
2. Клонируйте репозиторий
3. Установите зависимости: `npm install`
4. Создайте базу данных PostgreSQL
5. Запустите миграции: `npm run db:push`
6. Запустите проект: `npm run dev`

## Особенности реализации

- Используется Drizzle ORM для типобезопасной работы с базой данных
- Реализовано хеширование паролей с использованием scrypt
- Сессии хранятся в PostgreSQL через connect-pg-simple
- Аудио записи хранятся в формате base64 в базе данных
- Интеграция с OpenStreetMap для отображения геолокации
- Responsive дизайн для мобильных устройств
