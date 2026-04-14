# Darine Tracker Backend

This backend is built with Express, PostgreSQL, and Drizzle ORM. It provides:

- User registration and login
- JWT-based authentication
- Cycle CRUD and active cycle lookup
- Daily symptom log creation and retrieval

## Getting Started

1. Copy `.env.example` to `.env`
2. Set `DATABASE_URL`, `JWT_SECRET`, and `PORT`
3. Install dependencies:
   ```bash
   cd server
   npm install
   ```
4. Run in development:
   ```bash
   npm run dev
   ```

## Database Schema

Tables:

- `users`
- `cycles`
- `daily_logs`
- `user_settings`

## API Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `GET /cycles`
- `GET /cycles/active`
- `POST /cycles`
- `PATCH /cycles/:cycleId`
- `GET /logs`
- `GET /logs/:cycleId`
- `POST /logs`
