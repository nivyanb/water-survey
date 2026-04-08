import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="card w-full max-w-md">
        <h1 className="mb-1">Sign in</h1>
        <p className="text-sm text-gray-500 mb-6">Welcome back.</p>
        <LoginForm />
        <p className="text-sm text-gray-600 mt-6 text-center">
          No account?{" "}
          <Link href="/signup" className="text-blue-600 font-medium hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
