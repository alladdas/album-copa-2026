"use client";

import { useEffect } from "react";

export default function Error({
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
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-4xl">⚠️</p>
      <h2 className="text-lg font-semibold">Algo deu errado</h2>
      <p className="max-w-xs text-sm text-muted-foreground">
        Tente novamente. Se o problema persistir, recarregue a página.
      </p>
      <button
        onClick={reset}
        className="mt-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground active:scale-95"
      >
        Tentar novamente
      </button>
    </div>
  );
}
