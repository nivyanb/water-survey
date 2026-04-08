import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-4 -mt-14">
      <h1>Survey App</h1>
      <p className="text-gray-500">Share your feedback through quick surveys.</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/login" className="btn-secondary">
          Sign in
        </Link>
        <Link href="/signup" className="btn-primary">
          Sign up
        </Link>
      </div>
    </main>
  );
}
