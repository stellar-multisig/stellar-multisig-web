"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 text-center px-4">
      <p className="text-4xl font-bold text-slate-700">Error</p>
      <p className="text-lg font-medium text-slate-300">Something went wrong</p>
      <p className="text-sm text-slate-500 max-w-sm">
        An unexpected error occurred. Please try again.
      </p>
      <button
        onClick={reset}
        className="mt-2 rounded-lg bg-sky-600 hover:bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
