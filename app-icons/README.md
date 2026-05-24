# 📱 Ícones do app — Álbum Copa

Pacote completo do ícone da Capi em todos os formatos.

## Arquivos

| Arquivo            | Tamanho   | Usar para                                         |
|--------------------|-----------|---------------------------------------------------|
| `icon.svg`         | Vetor     | **Master** — escalável. Use no Next.js (`app/icon.svg`). |
| `icon-1024.png`    | 1024×1024 | Apple App Store / Play Store submissions          |
| `icon-512.png`     | 512×512   | Play Store / PWA `manifest.json`                  |
| `icon-192.png`     | 192×192   | PWA `manifest.json` (Android Chrome)              |
| `icon-180.png`     | 180×180   | Apple Touch Icon (iPhone @3x — home screen)       |
| `icon-152.png`     | 152×152   | iPad Touch Icon                                   |
| `icon-120.png`     | 120×120   | iPhone @2x                                        |
| `icon-96.png`      | 96×96     | Android medium / Chrome                           |
| `icon-64.png`      | 64×64     | Notification / system tray                        |
| `icon-32.png`      | 32×32     | Favicon                                           |

## Como usar — Next.js 14 App Router

A maneira mais simples (recomendada): copie só o SVG.

```
app/
├── icon.svg          ← copie icon.svg aqui (favicon + ícones gerais)
└── apple-icon.svg    ← copie icon.svg aqui de novo, renomeado
```

O Next.js gera automaticamente todos os tamanhos certos para cada plataforma a partir do SVG. Pronto.

## Como usar — PWA (manifest.json)

```json
{
  "name": "Álbum Copa 2026",
  "short_name": "Álbum Copa",
  "theme_color": "#1FB257",
  "background_color": "#FFF7E8",
  "display": "standalone",
  "start_url": "/",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any maskable" },
    { "src": "/icons/icon.svg",     "sizes": "any",     "type": "image/svg+xml" }
  ]
}
```

Copie os PNGs pra `public/icons/` e referencie como acima.

## Como usar — meta tags HTML (alternativa explícita)

Se quiser controlar manualmente em `app/layout.tsx`:

```tsx
export const metadata = {
  icons: {
    icon:  "/icons/icon-32.png",
    apple: "/icons/icon-180.png",
  },
};
```

## Como usar — submissão na App Store / Play Store

- **App Store Connect**: faça upload do `icon-1024.png` (PNG, sem transparência, sem cantos arredondados — a Apple arredonda automaticamente).
- **Google Play Console**: `icon-512.png` (32-bit PNG, com transparência permitida).

## Notas

- Todos os PNGs foram renderizados a partir do `icon.svg` em alta qualidade (imageSmoothingQuality: high).
- O SVG é o master — se quiser editar (trocar cores, ajustar mascote), edite ele e regenere os PNGs.
- O ícone **não usa** marcas registradas: a Capi é mascote original, os tons verde+amarelo são da bandeira brasileira (livres de marca), o losango é puramente decorativo.
