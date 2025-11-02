"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Formik, Form } from "formik";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { loginSchema } from "@/lib/yupSchemas";

interface LoginForm {
  email: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const verified = searchParams.get("verified");
    if (verified === "true") {
      setMessage("Email verified successfully! You can now log in.");
    } else if (verified === "false") {
      setError("Email verification failed. Please try again.");
    } else if (verified === "already") {
      setMessage("Email is already verified. You can log in.");
    }
  }, [searchParams]);

  const handleSubmit = async (values: LoginForm, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    try {
      setError(null);
      const result = await signIn("credentials", {
        email: values.email.trim().toLowerCase(),
        password: values.password,
        redirect: false
      });

      if (result?.error) {
        setError(result.error);
      } else if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-black px-4">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-zinc-900 p-8 rounded-lg shadow-lg">
        <div>
          <h2 className="text-3xl font-bold text-center text-foreground">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-zinc-600 dark:text-zinc-400">
            Or{" "}
            <Link
              href="/register"
              className="font-medium text-foreground hover:underline"
            >
              create a new account
            </Link>
          </p>
        </div>

        {message && (
          <div className="p-3 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-md text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-md text-sm">
            {error}
          </div>
        )}

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={loginSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-6">
              <Input
                label="Email address"
                name="email"
                type="email"
                autoComplete="email"
              />

              <Input
                label="Password"
                name="password"
                type="password"
                autoComplete="current-password"
              />

              <div className="flex items-center justify-between">
                <div className="text-sm">
                  <Link
                    href="/forgot-password"
                    className="font-medium text-foreground hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                isLoading={isSubmitting}
                className="w-full"
              >
                Sign in
              </Button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}

