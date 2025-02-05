# Архитектура системы Task Manager Pro

```ascii
┌─────────────────────────────────────────────────────────────────────┐
│                          Frontend (React)                           │
├───────────────┬─────────────────────┬──────────────────────────────┤
│  Components   │      Pages          │        Hooks                  │
│  └── UI      │  ├── AuthPage       │  ├── useAuth                  │
│      ├── Form│  ├── HomePage       │  ├── useToast                 │
│      ├── Card│  └── TaskDetails    │  └── useMobile               │
│      └── ... │                     │                              │
└──────┬────────────────────┬────────┴──────────────────────────────┘
       │                    │
       │   React Query      │  Authentication State
       │                    │
┌──────┴────────────────────┴──────────────────────────────────────┐
│                    Express Backend                                │
├─────────────────┬──────────────────┬───────────────────────────┬─┤
│  Auth Service   │  Task Service    │ Storage Interface         │ │
│  ├── Register   │  ├── Create      │ ├── User Operations      │ │
│  ├── Login      │  ├── Update      │ │   ├── Create          │ │
│  ├── Logout     │  ├── Delete      │ │   ├── Read            │ │
│  └── Session    │  └── Assign      │ │   └── Update          │ │
│                 │                  │ └── Task Operations      │ │
└─────────┬───────┴──────────┬──────┴───────────────┬───────────┘ │
          │                  │                      │             │
┌─────────┴──────────────────┴──────────────────────┴─────────────┤
│                      PostgreSQL Database                         │
├────────────────────────────┬──────────────────────────────────┬─┤
│         Users              │           Tasks                   │ │
│  ├── id                    │  ├── id                          │ │
│  ├── username             │  ├── userId                      │ │
│  ├── password             │  ├── assignedToId                │ │
│  └── isAdmin              │  ├── title                       │ │
│                           │  ├── description                  │ │
│                           │  ├── latitude                     │ │
│                           │  ├── longitude                    │ │
│                           │  └── audioUrl                     │ │
└───────────────────────────┴──────────────────────────────────┴─┘

Основные потоки данных:
1. Клиент → Сервер: REST API запросы через React Query
2. Сервер → База данных: Запросы через Drizzle ORM
3. Аутентификация: Passport.js + Express Session
4. Хранение сессий: PostgreSQL через connect-pg-simple

Ключевые технологии:
- Frontend: React, TypeScript, TanStack Query, ShadcnUI
- Backend: Express, Passport.js, Multer
- Database: PostgreSQL, Drizzle ORM
- Дополнительно: OpenStreetMap (геолокация), WebAudio API (аудио)
```

## Основные компоненты

### Frontend
1. **Компоненты UI (ShadcnUI)**
   - Формы, кнопки, карточки
   - Модальные окна
   - Навигация

2. **Страницы**
   - AuthPage: Авторизация/регистрация
   - HomePage: Список задач
   - TaskDetails: Детали задачи с геолокацией и аудио

3. **Хуки**
   - useAuth: Управление аутентификацией
   - useToast: Уведомления
   - useMobile: Адаптивность

### Backend
1. **Сервисы аутентификации**
   - Регистрация пользователей
   - Авторизация
   - Управление сессиями

2. **Управление задачами**
   - CRUD операции
   - Назначение исполнителей
   - Загрузка аудио
   - Геолокация

3. **Хранилище**
   - Интерфейс IStorage
   - Реализация DatabaseStorage
   - Сессии в PostgreSQL

### База данных
1. **Таблица users**
   - Хранение пользователей
   - Роли (админ/пользователь)

2. **Таблица tasks**
   - Основная информация
   - Связи с пользователями
   - Геоданные
   - Ссылки на аудио

## Взаимодействие компонентов

1. **Клиент-серверное взаимодействие**
   - REST API
   - React Query для кеширования
   - Типизация через общие схемы

2. **Аутентификация**
   - Passport.js для стратегий
   - Express Session для сессий
   - PostgreSQL для хранения

3. **Работа с данными**
   - Drizzle ORM для типобезопасности
   - Zod для валидации
   - Общие типы через schema.ts
