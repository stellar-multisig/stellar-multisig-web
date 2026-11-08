import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <p className="text-5xl font-bold text-slate-700">404</p>
      <p className="text-lg font-medium text-slate-300">Page not found</p>
      <p className="text-sm text-slate-500 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        href="/"
        className="mt-2 rounded-lg bg-sky-600 hover:bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors"
      >
        Go home
      </Link>
    </div>
  );
}
