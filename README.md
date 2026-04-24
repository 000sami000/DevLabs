# DevLabs

Production-oriented monorepo layout for the DevLabs platform.

## Structure

- `client/`: React + Vite frontend
- `server/`: Express + MongoDB backend
- `.env`: runtime environment values
- `.env.example`: example environment template
- `docker-compose.yml`: local MongoDB dependency

## Commands

- `npm run dev:client`: start the frontend
- `npm run dev:server`: start the backend with Node watch mode
- `npm run build:client`: build the frontend
- `npm run start:server`: run the backend in start mode

## Server Layout

- `server/src/config`: env, logger, and database bootstrap
- `server/src/modules`: feature-based modules
- `server/src/middlewares`: auth, error, and rate-limiting middleware
- `server/src/routes`: central route composition
- `server/src/utils`: shared helpers
- `server/src/app.js`: express app wiring
- `server/src/server.js`: process bootstrap

## Environment

Copy `.env.example` to `.env` and fill in the required values.

At minimum the backend needs:

- `JWT_SECRET`
- `MONGODB_URI`
- `ORIGIN`

The frontend reads `VITE_API_URL`.

## Notes

- The new runtime source of truth is `client/` and `server/`.
- Existing `Frontend/` and `Backend/` folders may still exist locally as migration fallback until you remove them.
