export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
      <div className="text-4xl">📭</div>
      <p className="text-lg font-medium text-slate-200">{title}</p>
      {description && <p className="text-sm text-slate-400 max-w-sm">{description}</p>}
      {action}
    </div>
  );
}
