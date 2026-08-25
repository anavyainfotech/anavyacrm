"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import { registerAction } from "@/features/auth/actions";
import { useState } from "react";

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await registerAction(formData);

    if (result?.error) {
      setError(result.error);
    }
  };

  return (
    <div className="rounded-md bg-white p-8 shadow-md border border-gray-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
        <h2 className="mt-2 text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Create your Workspace
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Get started with {siteConfig.name}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-sm border border-red-200 text-center font-medium">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="companyName" className="block text-sm font-semibold leading-6 text-gray-800">
              Company / Agency Name
            </label>
            <div className="mt-1">
              <input
                id="companyName"
                name="companyName"
                type="text"
                required
                className="block w-full rounded-sm border border-gray-300 py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:outline-none sm:text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-semibold leading-6 text-gray-800">
              Your Full Name
            </label>
            <div className="mt-1">
              <input
                id="name"
                name="name"
                type="text"
                required
                className="block w-full rounded-sm border border-gray-300 py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:outline-none sm:text-sm font-medium"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-semibold leading-6 text-gray-800">
              Email address
            </label>
            <div className="mt-1">
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
            <label htmlFor="password" className="block text-sm font-semibold leading-6 text-gray-800">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="block w-full rounded-sm border border-gray-300 py-2 px-3 text-gray-900 placeholder:text-gray-400 focus:border-blue-600 focus:outline-none sm:text-sm font-medium"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="flex w-full justify-center rounded-sm bg-blue-600 px-3 py-2 text-sm font-bold text-white shadow-xs hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Sign up
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-xs text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="font-bold text-blue-600 hover:text-blue-500">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
