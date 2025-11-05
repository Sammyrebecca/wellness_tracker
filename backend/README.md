# Wellness Backend (Express + MongoDB)

Minimal, fast wellness backend enabling 30-second daily check-ins, basic insights, and privacy-first design. Built with Node.js, Express (CommonJS), MongoDB/Mongoose, JWT, and Joi.

## Quick Start

- Copy `.env.example` to `.env` and adjust values
- Install dependencies: `npm install`
- Seed demo data (optional): `npm run seed`
- Start dev server: `npm run dev`
- Open API docs: `GET /api/docs`

## Scripts

- `npm run dev` – start with nodemon
- `npm start` – start server
- `npm test` – run Jest + supertest
- `npm run seed` – insert demo user + 30 days entries

## API Overview

- Auth: `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/logout`
- Me: `GET /api/me`, `PUT /api/me`, `DELETE /api/me` (501)
- Entries: `POST /api/entries`, `GET /api/entries`, `PUT /api/entries/:id`, `DELETE /api/entries/:id`
- Stats: `GET /api/stats?window=7|14|30`
- Docs: `/api/docs`

## Tech

- Express (CommonJS), Mongoose, JWT (HS256), bcrypt(12), Joi
- CORS allowlist (env-driven), helmet, morgan, rate-limit (auth routes)
- ESLint (Standard), Jest + supertest

## Project Structure

```
backend/
  app.js, server.js
  openapi.yaml
  src/
    config/ (env, db, cors, logger)
    models/ (User, Entry)
    middlewares/ (auth, validate, error, rateLimit)
    services/ (user, entry, stats, streak, token)
    controllers/ (auth, user, entry, stats)
    routes/ (index, auth, user, entry, stats)
    utils/ (date, responses)
    tests/ (integration)
    seed/ (seed.js)
```

## Notes

- Single entry per day enforced via unique compound index (userId+date)
- Edit/Delete window limited to last 7 days (403 otherwise)
- Stats provide averages, total steps, streaks, and trend deltas
- Passwords never returned; JWT returned on auth endpoints
- Placeholders: export route + account deletion (501), AI hooks in stats service

## Requirements

- MongoDB running locally or Atlas
- Node.js LTS

## Environment

See `.env.example` for required variables.

