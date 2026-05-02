# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This App Does

**Gerador de Minutas** is a decision-tree-based tool for the **Tribunal de Justiça do Paraná (TJPR)**. Judicial staff answer guided questions to classify irregularities in **preparo recursal** (appeal court fees) for exceptional appeals (REsp → STJ, RE → STF). The app navigates four main categories — **complementação**, **pagamento em dobro**, **deserção**, and **intempestivo** — and generates a ready-to-sign standardized decision text (minuta) for the selected path.

Only `@tjpr.jus.br` email addresses can register (enforced by a Supabase DB trigger and by `LoginPage.tsx` appending the domain automatically).

## Commands

```bash
npm run dev      # Start Vite dev server on http://localhost:3000
npm run build    # Production build (output: /dist)
npm run preview  # Preview production build locally
npm run lint     # TypeScript type-check only (tsc --noEmit) — no ESLint
npm run clean    # Remove dist directory
```

No test runner is configured.

The app is deployed to GitHub Pages at `/minuta/` (the `base` in `vite.config.ts` must stay `/minuta/`).

## Architecture

### Core Data Flow

1. `src/data/flow.ts` — declarative decision tree as `fluxo: Flow` (`{ [key: string]: Question }`). Each node has `pergunta` and `opcoes[]`, each option has `texto`, `snippet`, and `proximo`. Terminal options use `proximo: "final"` (helper `finalOption`).

2. `src/App.tsx` — walks the tree. State: `etapaAtual`, `historico` (`{ step, optionText, snippet }[]`), `finalizado`, `selectedOption`, `copiado`, `theme`, `session`, `userProfile`, `currentView`. On completion calls `fetchMinutaTemplate` (async, hits Supabase). UI: animated sidebar (`STEP_LABELS` / `STEP_ICONS` maps), `renderMinutaComColchetes` highlights `[PLACEHOLDER]` in red, `useReducedMotion()` disables animations per OS preference.

3. `src/data/minutaCatalog.ts` — recursively walks `fluxo` and builds `MinutaCatalogEntry[]`. Exports `minutaCatalog` and `findMinutaByPath(path: MinutaPathStep[])`.

4. `src/data/minutaTemplates.ts` — thin async layer over Supabase. `fetchMinutaTemplate(path)` queries `minuta_templates` table by `(step_key, option_text)` of the last path step. RE paths return `semReferencia` immediately without hitting the DB. Returns `MinutaTemplate { id, title, text, sourceFiles }`.

5. `src/lib/supabase.ts` — creates the Supabase client from `VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`. Client is `null!` if vars are missing (app logs a console error and auth features degrade gracefully).

6. `src/lib/auth.ts` — auth helpers: `signIn`, `signUp` (with `emailRedirectTo: origin/minuta/`), `signOut`, `resetPassword`, `updatePassword`, `updateProfile`, `exportUserData`. `getProfile` reads `profiles` table + `app_metadata` from JWT to resolve `role: 'user' | 'admin'` (avoids RLS recursion).

7. `src/components/LoginPage.tsx` — tabs: Entrar / Cadastrar / Recuperar. Auto-appends `@tjpr.jus.br` domain. Password strength meter.

8. `src/components/AdminPanel.tsx` — CRUD for `minuta_templates` rows. Only reachable when `userProfile.role === 'admin'`. Uses `minutaCatalog` to populate step/option selectors.

9. `src/components/ProfilePage.tsx` — edit `full_name`, change password, export personal data (LGPD Art. 18). Opens in password-reset mode when URL contains `#access_token` (post-recovery redirect).

10. `src/components/TJPR.tsx` — reusable component library (TJPRCard, TJPRButton, TJPRInput, TJPRHeader, TJPRBadge, TJPRFormGroup, TJPRModal, CookieConsent). No external UI library.

### Supabase Schema (`supabase/schema.sql`)

Two tables:
- `profiles` — extends `auth.users`; columns: `id`, `email`, `full_name`, `role` (default `'user'`). Trigger `on_auth_user_created` auto-creates a profile on signup. Trigger `enforce_email_domain` blocks non-`@tjpr.jus.br` signups.
- `minuta_templates` — stores minutas; columns: `id`, `step_key`, `option_text`, `title`, `template_text`, `source_files[]`, `created_by`. Unique on `(step_key, option_text)`.

RLS policies: authenticated users read templates; only admins write. `is_admin()` SECURITY DEFINER function avoids RLS recursion. To promote first admin: `UPDATE profiles SET role = 'admin' WHERE email = 'x@tjpr.jus.br';`

Files: `supabase/schema.sql` (full setup), `supabase/fix_rls.sql` (patch policies), `supabase/seed.sql` (sample data).

### Styling

- Tailwind CSS 4 via `@tailwindcss/vite`. Design tokens in `@theme {}` block in `src/index.css`: `--color-tjpr-navy-*`, `--color-tjpr-gold`, etc. Exposed as utilities (`text-tjpr-navy-900`, `bg-tjpr-gold`).
- Dark mode: class-based (`@variant dark (&:where(.dark, .dark *))`), toggled on `<html>`, persisted to `localStorage` under `theme-mode`.
- Border radius is 0 throughout (sharp institutional look). Semantic CSS classes (`question-card-dark`, `trail-panel-light`) defined in `src/index.css`.
- Material Icons via Google Fonts CDN in `index.html`.

### Adding New Decision Tree Branches

Edit `src/data/flow.ts` only — add nodes and `finalOption` entries. Update `STEP_LABELS` and `STEP_ICONS` in `App.tsx` for any new node keys. Templates live in Supabase (`minuta_templates` table), managed via AdminPanel. `App.tsx`, `minutaCatalog.ts`, and `minutaTemplates.ts` require no structural changes.

### Environment Variables

Copy `.env.example` to `.env.local`. Required for auth/templates:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```
`GEMINI_API_KEY` and `APP_URL` are defined but not yet wired into the UI.

### Docker / Production

Multi-stage `Dockerfile`: Node 20 Alpine builds, Nginx Alpine serves. `nginx.conf` handles SPA routing (all routes → `index.html`).
