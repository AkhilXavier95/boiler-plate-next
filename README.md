# 🚀 Next.js + Prisma + NextAuth

This project is a modern full-stack starter built with **Next.js (App Router)**, **Prisma ORM**, **NextAuth.js**, and **PostgreSQL**.  
It includes authentication (login/signup), email support, and is production-ready for deployment on **Vercel**, **Neon**, or **Railway**.

---

## 🧰 Tech Stack

- **Next.js 14+ (App Router)**
- **Prisma ORM** for database management
- **NextAuth.js** for authentication
- **PostgreSQL** (or SQLite for local dev)
- **TypeScript**
- **Shadcn/UI** for styled components
- **dotenv** for environment variables

---

## ⚙️ Environment Setup

1. Create a `.env` file in the project root:

   ```bash
   touch .env
   ```

2. Add the following environment variables:

```env
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/<dbname>?schema=public"

NEXTAUTH_SECRET="generate-a-random-secret"
NEXTAUTH_URL="http://localhost:3000"

EMAIL_SERVER_USER="your-email@example.com"
EMAIL_SERVER_PASSWORD="your-password"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_FROM="your-email@example.com"
```

##💡 You can generate a strong secret with:

```bash
openssl rand -base64 32
```

## 🗄️ Prisma Setup

1. Run initial migration

```bash
npm run db:migrate:init
```

2. View your database

### 1️⃣ Start Prisma development server

```bash
npx prisma studio
```

3. (Optional) Reset database

```bash
npx prisma migrate reset
```

### Prisma can manage a local Postgres instance for development and automatically sync schema changes.

Run:

```bash
npx prisma dev
```

---

## Development

```bash
npm run dev
```

## Authentication

- Authentication handled by NextAuth.js
- Supports Credentials (email/password)
- You can extend it with OAuth (Google, GitHub) by editing src/app/api/auth/[...nextauth]/route.ts

## Learn More

- Next.js Documentation
- Prisma Documentation
- NextAuth Documentation
