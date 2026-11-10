# JobTrack

Job application tracker for fresh grads. A Node/Express REST API with PostgreSQL. Web (React + Vite + Tailwind) and mobile (React Native + Expo) clients are planned.

## Setup

1. Install Node 20+ and PostgreSQL.
2. Create the database: `createdb -U postgres jobtrack`
3. Copy `server/.env.example` to `server/.env` and fill in your values.
4. Install and migrate:
   ```bash
   npm install
   npm run migrate
   ```
5. Start the API: `npm run server` (runs on http://localhost:4000)

## Project layout

```
server/           Express API: routes -> controllers -> services -> PostgreSQL
packages/shared/  Status list and allowed transitions, shared by every app
```

## API

Everything except register, login, health and statuses needs `Authorization: Bearer <token>`.

| Method             | Path                            | What it does                                      |
| ------------------ | ------------------------------- | ------------------------------------------------- |
| GET                | /api/health                     | Server and database check                         |
| GET                | /api/statuses                   | Statuses and allowed moves                        |
| POST               | /api/auth/register              | Create an account                                 |
| POST               | /api/auth/login                 | Log in, returns a token                           |
| GET                | /api/auth/me                    | Current user                                      |
| GET, POST          | /api/applications               | List (filter with `?status=` and `?q=`) or add    |
| GET, PATCH, DELETE | /api/applications/:id           | Get, edit or delete one                           |
| PATCH              | /api/applications/:id/status    | Change status (checked against the allowed moves) |
| GET, POST          | /api/applications/:id/notes     | List or add notes                                 |
| DELETE             | /api/notes/:id                  | Delete a note                                     |
| POST               | /api/applications/:id/reminders | Add a reminder                                    |
| GET                | /api/reminders?upcoming=true    | Your reminders, soonest first                     |
| PATCH, DELETE      | /api/reminders/:id              | Edit, mark done, or delete                        |
| GET                | /api/dashboard/summary          | Counts per status, next reminders, overdue count  |

## Status rules

Saved, Applied, Assessment, Interview, Offer, Rejected, Withdrawn. Each change is recorded in `status_history`.
