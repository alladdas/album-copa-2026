# 🚀 COMECE AQUI

Você tem tudo pronto pra construir o app. Ordem mínima para começar:

## 1. Crie a pasta do projeto e jogue estes arquivos dentro
```
album-copa-2026/
├── PROJECT.md              ← especificação (o Claude Code lê isto)
├── GUIA_CLAUDE_CODE.md     ← os prompts, em fases
├── README.md
├── .env.local.example
└── supabase/
    ├── schema.sql
    └── seed_data.sql
```

## 2. Supabase (≈5 min, você faz)
- Crie o projeto em supabase.com (região São Paulo).
- SQL Editor → rode `supabase/schema.sql`, depois `supabase/seed_data.sql`.
- Storage → crie bucket público `sticker-photos`.
- Copie Project URL + anon key (Project Settings → API).

## 3. Abra a pasta no VS Code e rode o Claude Code
No terminal, dentro da pasta: `claude`

## 4. Cole os prompts do GUIA_CLAUDE_CODE.md, em ordem
- Fase 1 (bootstrap) → Fase 2 (tipos+queries) → ... → Fase 7 (finalização).
- Crie `.env.local` (copie do exemplo) e cole suas chaves quando o guia pedir.
- A Fase 8 (imagens reais) é OPCIONAL — só quando quiser.

## 5. Deploy na Vercel (≈5 min, você faz)
Veja o final do GUIA_CLAUDE_CODE.md.

---
Pronto. O coração do app está nas Fases 4 (grid + tap rápido) e 6 (banca/trocas).
Se algo quebrar numa fase, cole o erro no Claude Code e peça pra corrigir antes
de avançar. Sempre que ele divagar: "siga o PROJECT.md".
