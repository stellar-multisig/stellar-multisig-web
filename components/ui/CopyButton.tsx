"use client";

import { useState } from "react";

export function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={copy}
      className="text-xs text-slate-400 hover:text-sky-400 transition-colors"
      title="Copy to clipboard"
    >
      {copied ? "✓ Copied" : label ?? "Copy"}
    </button>
  );
}
