import fs from "fs";
import { execSync } from "child_process";
import path from "path";

const ENV_PATH = path.resolve(".env");

// Step 1: Create .env if missing
if (!fs.existsSync(ENV_PATH)) {
  console.log("🧩 Creating .env file...");

  const defaultEnv = `
DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb?schema=public"
NEXTAUTH_SECRET="supersecretkey"
NEXTAUTH_URL="http://localhost:3000"

EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="user@example.com"
EMAIL_SERVER_PASSWORD="password"
FROM_EMAIL="noreply@example.com"
`;

  fs.writeFileSync(ENV_PATH, defaultEnv.trim());
  console.log("✅ .env created with default values");
} else {
  console.log("✅ .env already exists");
}

// Step 2: Run Prisma commands
console.log("🚀 Running Prisma migration & generation...");
execSync("npx prisma migrate dev --name init", { stdio: "inherit" });
execSync("npx prisma generate", { stdio: "inherit" });

// Step 3: (Optional) Seed DB
console.log("🌱 Seeding database...");
execSync("npx prisma db seed", { stdio: "inherit" });

// Step 4: Install dependencies
console.log("📦 Installing dependencies...");
execSync("npm install", { stdio: "inherit" });

// Step 5: Start development server
console.log("🔥 Starting dev server...");
execSync("npm run dev", { stdio: "inherit" });
