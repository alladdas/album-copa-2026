export default function FinancasPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-5 py-10 gap-6 bg-bg">
      <div className="text-center space-y-3">
        <div className="text-6xl">💰</div>
        <h1 className="font-display font-bold text-3xl text-ink">Gastos</h1>
        <p className="text-ink-mute text-sm max-w-xs">
          Controle de compras e custo por figurinha — em breve.
        </p>
      </div>

      <div
        className="w-full max-w-sm rounded-xl p-5 space-y-3 bg-elev shadow-md"
        style={{ border: "1px solid var(--line)" }}
      >
        <p className="font-display font-bold text-lg text-ink">O que chegará aqui:</p>
        <ul className="space-y-2 text-sm text-ink-soft">
          <li className="flex gap-2">
            <span>🛍️</span>
            <span>CRUD de compras com data, pacotes e valor</span>
          </li>
          <li className="flex gap-2">
            <span>📈</span>
            <span>Custo médio por pacote e por figurinha</span>
          </li>
          <li className="flex gap-2">
            <span>🔭</span>
            <span>Projeção de gasto para fechar o álbum</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
