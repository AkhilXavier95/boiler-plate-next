import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default async function Home() {
  const session = await getServerSession(authOptions);

  // If logged in, redirect to dashboard
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black px-4">
      <main className="flex flex-col items-center justify-center gap-8 text-center max-w-2xl">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            Welcome to Boundri Map
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Get started by signing in or creating a new account
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/login" prefetch={true}>
            <Button>Sign In</Button>
          </Link>
          <Link href="/register" prefetch={true}>
            <Button variant="outline">Create Account</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
