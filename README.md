# DersimAI

A self-hosted AI chat app. Built with Angular + Express in an Nx monorepo, backed by Qwen3 via Together AI. Supports streaming responses, persistent sessions, and automatic context condensation for long conversations.
Trimmed for concise and factual responses. 

## Stack

- **API** — Express, MongoDB, Redis, JWT, WebSockets
- **Website** — Angular 21, Angular Material, NgRx
- **AI** — Together AI (Qwen3)

## Setup

You'll need Node.js, MongoDB, and Redis running locally.

Create a `.env` in the root:

```env
MONGODB_URI=mongodb://localhost:27017/dersim
JWT_SECRET=...
TOGETHER_API_KEY=...

# optional
PORT=8000
ADMIN_SECRET=...
REDIS_HOST=localhost
REDIS_PORT=6379
CORS_ORIGINS=http://localhost:4200
```

Install and run:

```sh
npm install
npm start              # starts both API (:8000) and website (:4200)
npm run start:api      # API only
npm run start:website  # website only
```

## API

| Method | Path | Auth |
|--------|------|------|
| POST | `/user/register` | public |
| POST | `/user/login` | public |
| POST | `/user/logout` | user |
| GET | `/user/` | user |
| DELETE | `/user/:id` | user |
| POST | `/chat/:id` | user |
| POST | `/session/` | user |
| GET | `/session/` | user |
| GET | `/session/:id` | user |
| DELETE | `/session/:id` | user |
| GET | `/user/all` | admin |
| GET | `/user/:id` | admin |
| GET | `/session/all` | admin |
| GET | `/cache/stats` | admin |
| DELETE | `/cache/clear` | admin |

## Admin access

Set `ADMIN_SECRET` in your `.env` and pass it as a bearer token:

```
Authorization: Bearer your-admin-secret
```

## Project structure

```
apps/
  api/          Express app entry
  website/      Angular app entry
libs/
  shared/       Models, enums, errors shared across API and website
  api/          Feature libs: core, user, chat, session, cache
  website/      Feature libs: core, auth, chat, ui, store
```
