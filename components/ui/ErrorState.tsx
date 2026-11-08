export function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <div className="rounded-lg border border-red-800 bg-red-950/40 p-6 flex flex-col gap-3 items-start">
      <p className="text-sm font-medium text-red-400">Something went wrong</p>
      <p className="text-sm text-slate-300">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-sky-400 hover:text-sky-300 underline"
        >
          Try again
        </button>
      )}
    </div>
  );
}
