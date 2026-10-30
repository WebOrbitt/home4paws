# Home4Paws – Pet Adoption Portal

Home4Paws is a React and Vite pet adoption portal with a Node.js and Express API and a local SQLite database. Its existing responsive frontend is connected to persisted user, organization, pet, rescue report, and adoption data.

## Features

- Public pet browsing, search, filters, and pet profiles
- Adopter registration, login, profile, and adoption applications
- Multi-step NGO/Shelter registration with required verification documents
- Admin approval or rejection of organizations and user account management
- Pet creation, editing, multi-image uploads, and deactivation
- Public rescue reporting with private tracking tokens
- Assigned rescue workflow from review through pet profile creation and closure
- Organization review of applications; approval reserves a pet and completion marks it adopted
- Role-protected APIs, bcrypt password hashes, short-lived JWT access tokens, rotating HTTP-only refresh cookies, request validation, audit records, and rate limits

## Requirements

- Node.js 24.21.0 LTS recommended (Vite requires Node 20.19+ or 22.12+)
- SQLite is included through the backend package; no database server installation is needed
- VS Code and npm

The current workspace build used Node.js 24.15.0. Node.js 24.21.0 is the current 24.x LTS release. You can check yours with `node --version` and `npm --version` in the VS Code terminal. See the [official Node.js release schedule](https://nodejs.org/en/about/previous-releases).

## Folder structure

```text
home4paws/
├── backend/
│   ├── database/schema.sql
│   ├── scripts/                 # SQLite migration and admin seed scripts
│   ├── src/
│   │   ├── config/              # Environment and database pool
│   │   ├── middleware/          # Authentication, uploads, errors
│   │   ├── routes/              # Auth, organizations, pets, rescues, adoption, admin
│   │   └── utils/               # Validation, sessions, storage, audit
│   ├── .env.example
│   └── package.json
├── src/
│   ├── admin/                   # Admin and shared persisted data context
│   ├── auth/                    # Authentication context and route guards
│   ├── components/
│   ├── pages/
│   ├── services/                # Browser API clients
│   └── ...
├── public/
├── .env.example                 # Frontend API address
├── package.json
└── vite.config.js
```

The frontend stays at the project root; the backend is in `backend/`. No frontend files need to be moved.

## Local setup on Windows

Open the `home4paws` folder in VS Code. SQLite is installed with the backend packages; you do not need to install or start a separate database server.

### 1. Create the local database

The SQLite database file is created automatically when you run the migration. By default it is stored at `backend/.runtime/home4paws.sqlite`.

### 2. Configure and start the backend

In a VS Code terminal:

```powershell
cd backend
Copy-Item .env.example .env
```

Open `backend/.env` and set a private random `JWT_ACCESS_SECRET` of at least 32 characters, your chosen `ADMIN_EMAIL`, and a strong `ADMIN_PASSWORD` of at least 12 characters. `DB_FILE` is optional; leave its example value to use the default local database path. Do not share or commit this file.

Then run:

```powershell
npm install
npm run db:migrate
npm run db:seed-admin
npm run dev
```

Keep this terminal open. The API runs at `http://localhost:4000`. You can check `http://localhost:4000/api/health` for API status and `/api/health/ready` for API plus database status.

### 3. Configure and start the frontend

Open a second VS Code terminal from the `home4paws` folder:

```powershell
Copy-Item .env.example .env.local
npm install
npm run dev
```

Open the local URL Vite prints, usually `http://localhost:5173`. If `VITE_API_URL` is unset, Vite proxies `/api` and `/uploads` to the local backend. For the provided `.env.local`, the API address is `http://localhost:4000/api`.

The fresh database starts without sample pets. After creating an adopter, register an NGO/Shelter, sign in with the seeded admin account to approve it, then sign in to the approved organization account to add pet listings. Public rescue reports do not require an account.

## Production build

From the project root:

```powershell
npm run build
```

The optimized frontend files are written to `dist/`.

## Environment variables

### Backend (`backend/.env`)

| Variable | Required | Purpose |
| --- | --- | --- |
| `NODE_ENV` | No | Use `production` on the hosted API |
| `PORT` | No | API port; defaults to `4000` |
| `FRONTEND_ORIGINS` | In production | Comma-separated allowed frontend origins |
| `DB_FILE` | No | SQLite database path; defaults to `backend/.runtime/home4paws.sqlite` |
| `JWT_ACCESS_SECRET` | Yes | Private signing key, at least 32 characters |
| `JWT_ACCESS_TTL` | No | Short access-token duration; defaults to `15m` |
| `REFRESH_TOKEN_DAYS` | No | Refresh-session lifetime; defaults to `14` days |
| `ADMIN_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` | For admin seed | Initial private administrator account |
| `UPLOAD_DIRECTORY` | No | Local upload folder; defaults to `./uploads` |
| `MAX_UPLOAD_MB` | No | Upload limit; defaults to `10` MB |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Optional locally; recommended when hosted | Cloud storage for images and private documents |

### Frontend (`.env.local`)

`VITE_API_URL` is the API base URL ending in `/api`. It is public browser configuration. Never put a database password or signing secret in a `VITE_` variable.

## API overview

| Base path | Use |
| --- | --- |
| `/api/auth` | Register, login, refresh/logout session, current user, profile |
| `/api/organizations` | Registration, verified profile, private documents |
| `/api/pets` | Public listings/details and organization pet management/images |
| `/api/rescue-reports` | Public submission/token-based tracking and assigned workflow |
| `/api/adoption-applications` | Adopter applications and organization review workflow |
| `/api/admin` | Dashboard, organizations, users, pets, rescues, application monitoring |

All SQLite values use prepared statements. Backend validation is independent of frontend form validation. Only approved organizations can use organization management routes. A rescue tracking token is shown once after submission; save the status link to check that report later.

## Uploads

Without Cloudinary, pet images and private organization documents are kept on the backend under `backend/uploads/`. Pet images are served publicly; organization documents require an authorized API request. For a hosted backend, configure Cloudinary because local filesystem uploads may not survive redeployments. The API stores image metadata in SQLite.

## Deployment outline

1. Host the frontend as a static Vite site (for example, Vercel) with the project root as its build root, build command `npm run build`, output directory `dist`, and `VITE_API_URL` set to the hosted API's `/api` URL.
2. Host `backend/` as a Node service using `npm install` and `npm start`. Add the backend environment variables in the hosting dashboard; set `NODE_ENV=production`, the exact frontend origin in `FRONTEND_ORIGINS`, a persistent writable disk for the SQLite file, and a new private JWT secret.
3. Run the schema migration and seed the admin account securely. Keep the SQLite database file on persistent storage so it survives redeployments.
4. Configure Cloudinary for images and organization documents. Use HTTPS for both frontend and API. Do not use local-development secrets in production.

The Vite development proxy is local-only; deployed frontend requests go to `VITE_API_URL`. Configure the production origin explicitly. The app is not deployed by this repository change.

## Current scope notes

- Forgot-password still displays the existing frontend-only notice; there is no mail provider or reset-token workflow configured.
- Account email verification and email notifications are not configured.
- Cloudinary is optional in local development. If credentials are blank, uploads stay on this computer.
- Full end-to-end verification can run locally without separate database credentials; the SQLite file is created by `npm run db:migrate`.
