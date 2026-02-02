# Telegram Bot Collector

**Telegram Bot Collector** is a production-oriented Telegram backend service designed to collect, persist, and analyze all available Telegram updates generated during user interaction with a bot.

It focuses on reliability, data completeness, clean architecture, and extensibility. Every Telegram update is stored in a structured relational database along with the original raw payload, enabling future analytics, auditing, debugging, or integration with external systems.

---

## 🛠 Technology Stack

- Node.js
- NestJS
- Telegram Bot API (nestjs-telegraf)
- PostgreSQL
- Prisma ORM
- Redis
- Docker & Docker Compose
- Biome

---

## ✨ Key Features

- **Production Readiness**

  - Type-safe database access
  - Indexed tables for performance
  - Raw payload persistence
  - Dockerized services
  - Clean, maintainable NestJS architecture

- 📊 **Activity Analytics**
  - Total events per user
  - Events in the last 24 hours
  - Last activity timestamp

- ⚡ **Rate Limiting with Redis**
  - Protects /me command from spam

- 🐳 **Dockerized Infrastructure**
  - PostgreSQL
  - Redis
  - One-command startup

- 📥 **Full Telegram Update Collection**
  - message
  - edited_message
  - callback_query
  - inline_query
  - chat_member
  - my_chat_member

- 🧾 **Raw Payload Preservation**
  - Full original JSON payload stored for every update

- 👤 **User & Chat Profiling**
  - Automatic upsert of users and chats
  - First seen / last activity timestamps

---

## 🚀 Getting Started

### Environment Variables

Create a .env file:

 - DB_NAME=
 - DB_USER=
 - DB_PASSWORD=
 - DATABASE_URL=
 - BOT_TOKEN=
 - REDIS_URL=  

---

### Run with Docker
```bash
docker-compose up -d
```
---

### Install Dependencies
```bash
npm install
```
### Apply Migrations
```bash
npx prisma migrate dev
```
---

### Start Application
```bash
npm run start:dev
```
---

## 🧩 Project Architecture

- **BotUpdate** — Telegram update handling
- **BotService** — business logic layer
- **BotRepository** — database access layer
- **PrismaService** — PostgreSQL access via Prisma
- **RedisService** — rate limiting (bonus)

```text
src/
├── bot/                                  # Telegram Bot core
│   ├── bot.update.ts                    # Telegram update handlers (/start, /me, messages)
│   ├── bot.service.ts                   # Bot business logic
│   ├── bot.repository.ts                # Database access layer (Prisma)
│   ├── bot.types.ts                     # Shared bot types & interfaces
│   └── bot.module.ts                    # Bot NestJS module
│
├── prisma/                              # Database layer (Prisma)
│   ├── prisma.service.ts                # PrismaClient wrapper & lifecycle hooks
│   └── prisma.module.ts                 # Prisma NestJS module
│
├── redis/                               # Cache & queue layer (optional / bonus)
│   ├── redis.service.ts                 # Redis client, helpers, caching logic
│   └── redis.module.ts                  # Redis NestJS module
│
├── app.module.ts                        # Application root module
└── main.ts                              # Application entry point 
```


---

## 🗄️ Database Schema

### TgUser
- telegramId
- username, name, language
- isBot
- createdAt / updatedAt

### TgChat
- telegramId
- type, title, username
- createdAt / updatedAt

### TgEvent
- updateId (unique)
- eventType
- messageId
- dateUnix
- messageText
- **raw JSON payload**
- relations with user and chat

## ⚙️ Functionality

### `/start`
- Greets the user
- Saves the update to the database

### `/me`
Returns information **from the database only**:
- user data
- chat data
- activity metrics:
  - total number of events
  - number of events in the last 24 hours
  - timestamp of the last event

🔒 The command is protected by **Redis rate limiting** (1 request per 2 seconds)

### Any update
- Automatically stored in PostgreSQL
- Raw payload is persisted without data loss

---

## Example /me Response

```text
User
Telegram ID: 93292393
Username: UsernameExample
Name: First Last Name
Language: uk-UA
Is bot: false
First seen: 2026-02-02 09:14

Chat
Telegram ID: 4299420424
Type: private
Title: -
Username: UsernameExample

Activity
Total events: 5
Events (24h): 5
Last event: 2026-02-02 10:21
```