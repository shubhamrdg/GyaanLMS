# GyaanLMS Backend

The backend is the Express API for GyaanLMS. It handles authentication, role-protected course and lecture operations, enrollment, assignments, progress, feedback, and uploaded media.

For the complete application overview and frontend setup, see the [root README](../README.md).

## Requirements

- Node.js 18 or later
- MongoDB connection string

## Setup

From the repository root:

```bash
cd backend
npm install
```

Create `backend/.env` with:

```env
PORT=5000
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<a-long-random-secret>
CLIENT_URL=http://localhost:5173
```

Do not commit `.env` or put real credentials in documentation.

### Optional service configuration

| Variable | Purpose | Default |
|---|---|---|
| `JWT_EXPIRE` | JWT lifetime | `7d` |
| `CLOUDINARY_URL` | Cloudinary connection URL | None |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name when not using `CLOUDINARY_URL` | None |
| `CLOUDINARY_API_KEY` | Cloudinary API key when not using `CLOUDINARY_URL` | None |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret when not using `CLOUDINARY_URL` | None |
| `EMAIL_HOST` | SMTP server | `smtp.zoho.in` |
| `EMAIL_PORT` | SMTP port | `465` |
| `EMAIL_SECURE` | Use secure SMTP | `true` |
| `EMAIL_USER` | SMTP account | None |
| `EMAIL_PASS` | SMTP password or app password | None |
| `EMAIL_FROM_NAME` | Sender display name | `gyaanlms` |

Email delivery requires both `EMAIL_USER` and `EMAIL_PASS`. Cloudinary can be configured with `CLOUDINARY_URL` or with all three separate Cloudinary variables.

## Run

Development server with automatic reload:

```bash
npm run dev
```

Production-style server:

```bash
npm start
```

The default API address is `http://localhost:5000`. `GET /` is a health check. The frontend Vite configuration proxies `/api` and `/uploads` to this address during local development.

## API route groups

All API routes are under `/api`:

| Route prefix | Purpose |
|---|---|
| `/auth` | Registration, login, account, and email flows |
| `/courses` | Course browsing and management |
| `/lectures` | Course lectures and media |
| `/orders` | Enrollment/order operations |
| `/users` | User administration |
| `/assignments` | Assignment creation and submission |
| `/progress` | Student lesson and course progress |
| `/feedback` | Course feedback |
| `/platform-feedback` | Platform feedback |
| `/contacts` | Contact inquiries |
| `/queries` | Course questions and faculty responses |
| `/sessions` | Live learning sessions |

Route-level authentication and role checks are applied by the route handlers.

## Progress and certificates

The API records lesson completion and course completion in the student's progress record. It does not generate or store certificate files. Once the course is complete, the frontend creates a certificate PDF when the student selects **View Certificate** and opens it in a new tab.

## Database seeding

To insert the local demo users and courses:

```bash
npm run seed
```

**Warning:** the seed script deletes all existing user and course records in the database selected by `MONGO_URI` before inserting demo data. Use it only with a disposable development database.

The `npm run verify-users` script is available for checking existing user records.

## Deployment notes

- Set production values for `MONGO_URI`, `JWT_SECRET`, `CLIENT_URL`, and any required email or Cloudinary variables.
- Set `CLIENT_URL` to the deployed frontend origin. The CORS allowlist includes the local Vite origin, the documented Render and Vercel frontend URLs, and `CLIENT_URL`.
- Never commit environment files, credentials, or production secrets.
