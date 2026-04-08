import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="card w-full max-w-md">
        <h1 className="mb-1">Create account</h1>
        <p className="text-sm text-gray-500 mb-6">Join to create and manage surveys.</p>
        <SignupForm />
        <p className="text-sm text-gray-600 mt-6 text-center">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
