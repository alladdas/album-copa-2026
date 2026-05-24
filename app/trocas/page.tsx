export default function TrocasPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-5 py-10 gap-6 bg-bg">
      <div className="text-center space-y-3">
        <div className="text-6xl">🔄</div>
        <h1 className="font-display font-bold text-3xl text-ink">Trocas</h1>
        <p className="text-ink-mute text-sm max-w-xs">
          Gerador de lista para WhatsApp — em breve.
        </p>
      </div>

      <div
        className="w-full max-w-sm rounded-xl p-5 space-y-3 bg-elev shadow-md"
        style={{ border: "1px solid var(--line)" }}
      >
        <p className="font-display font-bold text-lg text-ink">O que chegará aqui:</p>
        <ul className="space-y-2 text-sm text-ink-soft">
          <li className="flex gap-2">
            <span>✅</span>
            <span>Lista de repetidas com quantidades</span>
          </li>
          <li className="flex gap-2">
            <span>❌</span>
            <span>Lista de faltantes por seleção</span>
          </li>
          <li className="flex gap-2">
            <span>📱</span>
            <span>Gerar texto para WhatsApp + Compartilhar</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
