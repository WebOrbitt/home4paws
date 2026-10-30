# Home4Paws API

Express 5 API for the existing React/Vite Home4Paws portal. It uses SQLite for related users, organizations, pets, rescue reports, and adoption applications. The database is a local file; a separate database server and database password are not needed.

## Local setup

1. From this folder, copy `.env.example` to `.env`. Set a private `JWT_ACCESS_SECRET` of at least 32 characters and your chosen `ADMIN_EMAIL` and strong `ADMIN_PASSWORD` (at least 12 characters). Keep this file private.
2. Install packages, create the database tables, and seed the first admin:

   ```powershell
   npm install
   npm run db:migrate
   npm run db:seed-admin
   npm run dev
   ```

The SQLite database is created at `backend/.runtime/home4paws.sqlite` by default. To store it somewhere else, change `DB_FILE` in `.env`. The API listens at `http://localhost:4000`. `GET /api/health` reports API status; `GET /api/health/ready` also checks the database.

Use the seeded admin credentials from `ADMIN_EMAIL` and `ADMIN_PASSWORD`; there is no public admin registration endpoint.

## Upload storage

For local development, images are stored under `backend/uploads/pets` and organization documents under `backend/uploads/private-documents`. Pet images are served from `/uploads/pets`; organization documents are only served through authenticated owner/admin routes. If Cloudinary credentials are supplied, uploads use Cloudinary instead. Organization files use authenticated delivery and short-lived signed downloads.

## API areas

| Base path | Purpose |
| --- | --- |
| `/api/auth` | Adopter registration, login, refresh, logout, current user, profile |
| `/api/organizations` | Organization registration, profile, private documents |
| `/api/pets` | Public search/details and organization pet management/images |
| `/api/rescue-reports` | Public report and token-protected tracking; assigned organization workflow |
| `/api/adoption-applications` | Adopter applications and organization review workflow |
| `/api/admin` | Dashboard counts, organizations, users, pets, rescues, adoption monitoring |

Access tokens are short-lived JWTs returned to the caller. Refresh tokens are random, rotated, stored hashed in SQLite, and sent in an HTTP-only cookie. All database values use prepared statements.

## Frontend

The frontend uses `VITE_API_URL=http://localhost:4000/api` in a root `.env.local` file. Vite variables are public browser configuration; never put database or JWT secrets in frontend environment variables.
