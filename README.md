# DamDam Backend

Node.js + Express + TypeScript backend for auth, users, products, cart, and orders.

## Project Structure

- `src/Auth` auth module (`controller`, `dto`, `model`, `routes`, `service`)
- `src/User` user module
- `src/Product` product module
- `src/Cart` cart module
- `src/Order` order module
- `src/config` environment, db, passport config
- `src/middlewares` auth + error middleware
- `src/utils` shared helpers (tokens, cookies, validators, email, async handler)
- `src/docs` OpenAPI spec
- `src/routes` shared non-domain routes (`health`, `docs`)

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

- Copy `.env.example` to `.env`
- Fill required values

3. Start development server:

```bash
npm run dev
```

4. Build for production:

```bash
npm run build
```

5. Start compiled server:

```bash
npm run start
```

## Environment Variables

Required core variables:

- `NODE_ENV`
- `PORT`
- `MONGO_URI` (or `MONGO_URL`, both are supported by `env.ts`)
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_TTL`
- `JWT_REFRESH_TTL`
- `CLIENT_ORIGIN`

Password reset/email variables:

- `PASSWORD_RESET_TTL_MINUTES`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`

Google OAuth variables:

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_CALLBACK_URL`
- `GOOGLE_AUTH_SUCCESS_REDIRECT` (optional, defaults to `<CLIENT_ORIGIN>/auth/callback`)
- `GOOGLE_AUTH_FAILURE_REDIRECT` (optional, defaults to `<CLIENT_ORIGIN>/login`)

Admin seed variables:

- `SEED_ADMIN_NAME`
- `SEED_ADMIN_EMAIL`
- `SEED_ADMIN_PASSWORD`

## API Docs

- Swagger UI: `GET /api/docs`
- OpenAPI JSON: `GET /api/docs.json`

## Auth Notes

- Refresh token is stored as an HTTP-only cookie.
- Access token is returned in JSON (`login`, `refresh`) and is expected as `Authorization: Bearer <token>` for protected routes.
- Google callback redirects to frontend without putting access token in URL query.
- Only existing admins can create new admins via `POST /api/users/create-admin`.

## Admin Bootstrap

Create or promote a bootstrap admin:

```bash
npm run seed:admin
```

Behavior:

- If `SEED_ADMIN_EMAIL` does not exist, a new `ADMIN` user is created.
- If the user exists, it is promoted/updated to `ADMIN`.

## Route Mounts

Mounted in `src/app.ts`:

- `/api/health`
- `/api/auth`
- `/api/users`
- `/api/products`
- `/api/cart`
- `/api/orders`
- `/api/docs`, `/api/docs.json`
