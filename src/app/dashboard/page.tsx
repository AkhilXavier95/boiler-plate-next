import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { SignOutButton } from "@/components/SignOutButton";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
              <p className="text-zinc-600 dark:text-zinc-400 mt-2">
                Welcome back, {session.user?.name || session.user?.email}!
              </p>
            </div>
            <SignOutButton />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                User Profile
              </h2>
              <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <p><strong>Email:</strong> {session.user?.email}</p>
                {session.user?.name && (
                  <p><strong>Name:</strong> {session.user.name}</p>
                )}
              </div>
            </div>

            <div className="p-6 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Quick Actions
              </h2>
              <div className="space-y-2 text-sm">
                <p className="text-zinc-600 dark:text-zinc-400">
                  Your dashboard is ready. Add more features here!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

