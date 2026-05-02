# AGENTS.md

## Commands

```bash
npm run dev      # Vite dev server on :3000
npm run build    # Production build → dist/
npm run lint     # TypeScript typecheck only (tsc --noEmit) — NO linter
npm run clean    # Remove dist/
```

No test runner configured. No ESLint.

## Architecture

Decision-tree wizard app for TJPR judicial staff. React 19 + Vite 6 + TypeScript 5.8 + Tailwind CSS 4 + Supabase.

**Data flow:** `src/data/flow.ts` (decision tree) → `minutaCatalog.ts` (catalog builder) → `minutaTemplates.ts` (async Supabase fetch) → `App.tsx` (wizard UI).

**Auth:** Supabase Auth. Registration restricted to `@tjpr.jus.br` emails (enforced in `LoginPage.tsx` + DB trigger). `userProfile.role === 'admin'` needed for AdminPanel access.

**Templates:** Stored in Supabase `minuta_templates` table, managed via `AdminPanel.tsx`. REsp paths fetch from DB; RE paths return `SEM_REFERENCIA` without querying.

## Key Conventions

- **`@/*` path alias maps to project root (`.`), NOT `src/`.** Import like `import { x } from '@/src/lib/auth'`, not `@/lib/auth`.
- **Tailwind CSS 4** via `@tailwindcss/vite` plugin — no `tailwind.config.js`, no PostCSS. Design tokens in `@theme {}` block in `src/index.css`.
- **Dark mode** toggled on `<html>` class, persisted to `localStorage` key `theme-mode`. `@variant dark (&:where(.dark, .dark *))`.
- **Border radius: 0 everywhere.** Institutional TJPR style. `--radius-sm/md/lg: 0px` in `:root`.
- **Custom UI components only** (`src/components/TJPR.tsx`). No external UI library. No `rounded-*` unless explicitly TJPR-branded.
- **Copy-to-clipboard** renders Word-compatible HTML with MSO namespaces (`copiarTexto` in App.tsx).
- **Motion/reduced-motion**: `useReducedMotion()` from `motion/react` disables animations per OS preference.

## Adding Decision Tree Branches

Edit `src/data/flow.ts` only. Add nodes and `finalOption` entries. Then update `STEP_LABELS` and `STEP_ICONS` maps in `App.tsx` for new node keys. `minutaCatalog.ts` and `minutaTemplates.ts` require no structural changes. Templates themselves go in Supabase.

## Env & Deployment

- Local: copy `.env.example` → `.env.local`. Required: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`.
- Supabase client is `null!` if env vars missing — auth/template features degrade gracefully, wizard still works.
- `GEMINI_API_KEY` defined but not wired to UI.
- Vite `base: '/minuta/'` — must stay for GitHub Pages deployment.
- **CI:** `.github/workflows/deploy.yml` — deploy to GitHub Pages on push to `main`. Secrets `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` set in repo.
- **Docker:** Multi-stage `Dockerfile` — Node 20 Alpine build, Nginx Alpine serve. `nginx.conf` handles SPA routing.

## Gotchas

- `npm run lint` won't catch ESLint issues — it only runs `tsc --noEmit`.
- Supabase `profiles` table auto-creates on signup via DB trigger. Promote first admin manually: `UPDATE profiles SET role = 'admin' WHERE email = 'x@tjpr.jus.br'`.
- `experimentalDecorators` + `useDefineForClassFields: false` in tsconfig — don't change without checking for decorator usage.
- The `minutas/` directory (reference PDFs) and `materiais/*.txt` are gitignored — regenerate from PDFs if needed.