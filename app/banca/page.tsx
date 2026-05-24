export default function BancaPage() {
  return (
    <div data-theme="dark" className="min-h-screen bg-bg text-ink">
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-5 py-10 gap-6">
        <div className="text-center space-y-3">
          <div className="text-6xl">🏪</div>
          <h1 className="font-display font-bold text-4xl">Modo Banca</h1>
          <p className="text-ink-soft text-base max-w-xs">
            Tela de alto contraste para usar na banca — em breve.
          </p>
        </div>

        <div
          className="w-full max-w-sm rounded-xl p-5 space-y-3 bg-elev"
          style={{ border: "1px solid var(--line)" }}
        >
          <p className="font-display font-bold text-lg">O que chegará aqui:</p>
          <ul className="space-y-2 text-sm text-ink-soft">
            <li className="flex gap-2">
              <span>🔢</span>
              <span>Toggle gigante FALTAM ↔ REPETIDAS</span>
            </li>
            <li className="flex gap-2">
              <span>⌨️</span>
              <span>Teclado numérico grande para registrar figurinhas</span>
            </li>
            <li className="flex gap-2">
              <span>📍</span>
              <span>Escolha da origem (qual banca você está)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
