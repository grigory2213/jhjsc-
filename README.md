├── client/                      # Frontend код
│   ├── src/
│   │   ├── components/         # React компоненты
│   │   ├── hooks/             # React хуки
│   │   ├── lib/               # Утилиты
│   │   └── pages/             # Страницы приложения
├── server/                     # Backend код
│   ├── auth.ts                # Аутентификация
│   ├── db.ts                  # Подключение к БД
│   ├── routes.ts              # API маршруты
│   └── storage.ts             # Слой хранения
├── shared/                     # Общий код
│   └── schema.ts              # Схемы данных
```

## Запуск проекта

1. Убедитесь, что у вас установлен Node.js и PostgreSQL
2. Клонируйте репозиторий
3. Установите зависимости:
```bash
npm install
```

4. Создайте базу данных PostgreSQL и настройте переменные окружения:
```env
DATABASE_URL=postgres://user:password@localhost:5432/dbname
```

5. Запустите миграции:
```bash
npm run db:push
```

6. Запустите проект:
```bash
npm run dev
```

## API маршруты

### Аутентификация
- POST `/api/register` - Регистрация
- POST `/api/login` - Авторизация
- POST `/api/logout` - Выход
- GET `/api/user` - Получение текущего пользователя

### Задачи
- GET `/api/tasks` - Получение списка задач
- GET `/api/tasks/:id` - Получение конкретной задачи
- POST `/api/tasks` - Создание задачи (только админ)
- PATCH `/api/tasks/:id` - Обновление задачи
- DELETE `/api/tasks/:id` - Удаление задачи (только админ)
- POST `/api/tasks/:id/audio` - Загрузка аудио

### Пользователи
- GET `/api/users` - Получение списка пользователей (только админ)


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

## Особенности реализации

- Используется Drizzle ORM для типобезопасной работы с базой данных
- Реализовано хеширование паролей с использованием scrypt
- Сессии хранятся в PostgreSQL через connect-pg-simple
- Аудио записи хранятся в формате base64 в базе данных
- Интеграция с OpenStreetMap для отображения геолокации
- Responsive дизайн для мобильных устройств