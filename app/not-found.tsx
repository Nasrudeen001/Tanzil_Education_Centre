import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-900 text-white">
      <h1 className="text-5xl font-bold mb-4">404 - Page Not Found</h1>
      <p className="mb-8 text-lg">Sorry, the page you are looking for does not exist.</p>
      <Link href="/" className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors">
        Go Home
      </Link>
    </div>
  );
} 