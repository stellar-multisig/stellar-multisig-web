export default function AccountLoading() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      <div className="flex flex-col gap-2">
        <div className="h-6 w-48 rounded bg-slate-800" />
        <div className="h-4 w-96 rounded bg-slate-800" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900 h-48" />
        <div className="rounded-xl border border-slate-800 bg-slate-900 h-48" />
      </div>
      <div className="flex flex-col gap-3">
        <div className="h-5 w-40 rounded bg-slate-800" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 rounded-xl border border-slate-800 bg-slate-900" />
        ))}
      </div>
    </div>
  );
}
