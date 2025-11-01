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

### For Local Development (without Docker)

1. Create a `.env` file in the project root:

   ```bash
   touch .env
   ```

2. Add the following environment variables:

```env
# Database (local PostgreSQL)
DATABASE_URL="postgresql://<username>:<password>@localhost:5432/<dbname>?schema=public"

# NextAuth
NEXTAUTH_SECRET="generate-a-random-secret"
NEXTAUTH_URL="http://localhost:3000"

# Email Configuration (optional)
EMAIL_SERVER_USER="your-email@example.com"
EMAIL_SERVER_PASSWORD="your-password"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_FROM="your-email@example.com"
```

### For Docker Development/Production

See the [Docker Setup](#-docker-setup) section below for Docker-specific environment variables.

### Generate a Strong Secret

```bash
openssl rand -base64 32
```

Copy the output and use it as your `NEXTAUTH_SECRET`.

## 🗄️ Prisma Setup

### Local Development (without Docker)

1. **Run initial migration:**

```bash
npm run db:migrate:init
```

2. **View your database with Prisma Studio:**

```bash
npm run db:studio
# Opens at http://localhost:5555
```

3. **Create new migration:**

```bash
npm run db:migrate
```

4. **Deploy migrations (production):**

```bash
npm run db:deploy
```

5. **Reset database (⚠️ deletes all data):**

```bash
npx prisma migrate reset
```

6. **Generate Prisma Client:**

```bash
npx prisma generate --no-engine
```

### Docker + Prisma Setup

When using Docker, Prisma is automatically configured:

- ✅ **Prisma Client** is generated during Docker build
- ✅ **Schema sync** runs automatically on container startup:
  - **Development mode**: Uses `prisma db push` (fast schema sync, no migration files)
  - **Production mode**: Uses `prisma migrate deploy` (applies migration files)
- ✅ **Prisma CLI** is available in containers for manual operations

**Prisma commands in Docker:**

```bash
# Run migrations
docker compose exec app npm run db:migrate

# Generate Prisma Client (after schema changes)
docker compose exec app npx prisma generate --no-engine

# Access Prisma Studio (database GUI)
docker compose exec app npx prisma studio
# Then visit http://localhost:5555

# Seed database
docker compose exec app npm run seed

# View database directly via psql
docker compose exec postgres psql -U postgres -d boundri_db

# Reset database (⚠️ deletes all data)
docker compose exec app npx prisma migrate reset
```

**Note:** In production mode (`docker-compose.yml`), migrations run automatically when the app container starts.

---

## 🐳 Docker Setup

### Prerequisites

1. **Install Docker Desktop** (if not already installed)

   - Download from [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
   - Make sure Docker Desktop is running before using Docker commands

2. **Create `.env` file** with environment variables:

```env
# Database (used by Docker Compose)
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=boundri_db
POSTGRES_PORT=51214

# Application
APP_PORT=3000
# Note: DATABASE_URL uses port 5432 (internal container port) and 'postgres' (service name)
# For connections from host machine, use localhost:51214
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/boundri_db?schema=public

# NextAuth
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32
NEXTAUTH_URL=http://localhost:3000

# Email Configuration (optional)
# EMAIL_HOST=smtp.example.com
# EMAIL_PORT=587
# EMAIL_USER=your-email@example.com
# EMAIL_PASSWORD=your-password
```

### Quick Start

#### Development Mode (with hot-reload)

```bash
# Start development environment
npm run docker:dev

# Or manually:
docker compose -f docker-compose.dev.yml up
```

This will:

- Start PostgreSQL database
- Start Next.js app with hot-reload
- Access app at `http://localhost:3000`

#### Production Mode

```bash
# Build and start containers
npm run docker:build
npm run docker:up

# View logs
npm run docker:logs

# Stop containers
npm run docker:down
```

### Docker Commands Reference

| Command                    | Description                                |
| -------------------------- | ------------------------------------------ |
| `npm run docker:build`     | Build production Docker images             |
| `npm run docker:up`        | Start production containers in background  |
| `npm run docker:down`      | Stop and remove containers                 |
| `npm run docker:dev`       | Start development environment (foreground) |
| `npm run docker:dev:build` | Build development images                   |
| `npm run docker:logs`      | View application logs                      |

### Manual Docker Commands

```bash
# Build images
docker compose build

# Start services
docker compose up -d

# View logs
docker compose logs -f app

# Stop services
docker compose down

# Stop and remove volumes (⚠️ deletes database data)
docker compose down -v

# Access database directly
docker compose exec postgres psql -U postgres -d boundri_db

# Run migrations manually
docker compose exec app npx prisma migrate deploy --config prisma.config.ts

# Generate Prisma Client
docker compose exec app npx prisma generate --no-engine

# Access app container shell
docker compose exec app sh

# Prisma Studio (database GUI)
docker compose exec app npx prisma studio
# Access at http://localhost:5555
```

### Development Workflow

1. **Start Docker services:**

   ```bash
   npm run docker:dev
   ```

   This will automatically:

   - Generate Prisma Client
   - Push schema changes to database (`prisma db push`)
   - Start the Next.js dev server

2. **Manual migrations (if you prefer using migration files):**

   ```bash
   # Create a new migration
   docker compose exec app npm run db:migrate

   # Note: Development mode uses `db push` automatically (fast schema sync)
   # Production mode uses `migrate deploy` (applies migration files)
   ```

3. **Seed database (optional):**

   ```bash
   docker compose exec app npm run seed
   ```

4. **Access Prisma Studio (database GUI):**

   ```bash
   docker compose exec app npx prisma studio
   # Then open http://localhost:5555 in your browser
   ```

5. **Make schema changes:**

   ```bash
   # After editing prisma/schema.prisma
   docker compose exec app npm run db:migrate
   docker compose exec app npx prisma generate --no-engine
   ```

### Troubleshooting

**Docker daemon not running:**

```bash
# Start Docker Desktop manually or:
open -a Docker
```

**Port already in use:**

- Change `APP_PORT` or `POSTGRES_PORT` in `.env` file

**Database connection errors:**

- Ensure PostgreSQL container is healthy: `docker compose ps`
- Check database URL in `.env` matches Docker service name

**Rebuild everything:**

```bash
docker compose down -v  # Remove containers and volumes
docker compose build --no-cache  # Rebuild without cache
docker compose up -d
```

**View container status:**

```bash
docker compose ps
```

**View container logs:**

```bash
docker compose logs -f  # All services
docker compose logs -f app  # Just the app
docker compose logs -f postgres  # Just the database
```

---

## 🚀 Development

### Local Development (without Docker)

```bash
# Install dependencies
npm install

# Run database migrations
npm run db:migrate

# Start development server
npm run dev

# Access Prisma Studio
npm run db:studio
```

The app will be available at `http://localhost:3000`

### Docker Development

See the [Docker Setup](#-docker-setup) section for Docker-based development.

## 🔐 Authentication

- **Authentication handled by NextAuth.js**
- Supports **Credentials** (email/password)
- **Session management** via Prisma (stored in database)
- You can extend it with **OAuth** (Google, GitHub) by editing `src/app/api/auth/[...nextauth]/route.ts`

## 📝 Available Scripts

| Script                    | Description                      |
| ------------------------- | -------------------------------- |
| `npm run dev`             | Start Next.js development server |
| `npm run build`           | Build for production             |
| `npm run start`           | Start production server          |
| `npm run lint`            | Run ESLint                       |
| `npm run db:migrate`      | Run Prisma migrations            |
| `npm run db:migrate:init` | Initialize first migration       |
| `npm run db:deploy`       | Deploy migrations (production)   |
| `npm run db:studio`       | Open Prisma Studio               |
| `npm run seed`            | Seed the database                |
| `npm run docker:build`    | Build Docker images              |
| `npm run docker:up`       | Start Docker containers          |
| `npm run docker:down`     | Stop Docker containers           |
| `npm run docker:dev`      | Start Docker development         |

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Docker Documentation](https://docs.docker.com)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is private and proprietary.
