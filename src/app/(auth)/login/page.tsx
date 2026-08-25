"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import { useState } from "react";
import { loginAction } from "@/features/auth/actions";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await loginAction(formData);
    
    if (result?.error) {
      setError(result.error);
    }
  };

  return (
    <div className="rounded-md bg-white p-8 shadow-md border border-gray-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
        <h2 className="mt-2 text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Welcome back to {siteConfig.name}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-sm border border-red-200 text-center font-medium">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-semibold leading-6 text-gray-800">
              Email address
            </label>
            <div className="mt-1.5">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-sm border border-gray-300 py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:outline-none sm:text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="block text-sm font-semibold leading-6 text-gray-800">
                Password
              </label>
              <div className="text-xs">
                <a href="#" className="font-semibold text-blue-600 hover:text-blue-500">
                  Forgot password?
                </a>
              </div>
            </div>
            <div className="mt-1.5">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="block w-full rounded-sm border border-gray-300 py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:outline-none sm:text-sm font-medium"
              />
            </div>
          </div>

          <div className="pt-1">
            <button
              type="submit"
              className="flex w-full justify-center rounded-sm bg-blue-600 px-3 py-2 text-sm font-bold text-white shadow-xs hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Sign in
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          Don't have an account?{" "}
          <Link href="/register" className="font-bold text-blue-600 hover:text-blue-500">
            Create a workspace
          </Link>
        </p>
      </div>
    </div>
  );
}
