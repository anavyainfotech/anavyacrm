import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function MarketingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 tracking-tight">
        Manage your <span className="text-primary-500">Business</span> efficiently
      </h1>
      <p className="mt-6 text-lg text-gray-600 max-w-2xl">
        {siteConfig.description} Manage clients, projects, invoices, and support tickets all from one powerful, unified dashboard.
      </p>
      <div className="mt-10 flex gap-4">
        <Link 
          href="/login"
          className="rounded-md bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-all"
        >
          Get Started
        </Link>
      </div>
    </div>
  );
}
