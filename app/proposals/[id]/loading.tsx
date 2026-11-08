export default function ProposalLoading() {
  return (
    <div className="flex flex-col gap-8 max-w-3xl animate-pulse">
      <div className="flex flex-col gap-2">
        <div className="h-6 w-64 rounded bg-slate-800" />
        <div className="h-4 w-48 rounded bg-slate-800" />
      </div>
      <div className="rounded-xl border border-slate-800 bg-slate-900 h-40" />
      <div className="rounded-xl border border-slate-800 bg-slate-900 h-64" />
      <div className="rounded-xl border border-slate-800 bg-slate-900 h-48" />
    </div>
  );
}
