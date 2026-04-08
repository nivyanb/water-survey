"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";

export function Header() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  if (loading) return null;

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-6 py-3">
        <Link href={user ? "/surveys" : "/"} className="text-lg font-bold text-gray-900">
          Survey App
        </Link>

        {user ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.name}</span>
            <button onClick={handleLogout} className="btn-secondary text-xs">
              Logout
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link href="/login" className="btn-secondary text-xs">
              Sign in
            </Link>
            <Link href="/signup" className="btn-primary text-xs">
              Sign up
            </Link>
          </div>
        )}
      </div>
    </header>
  );
}
