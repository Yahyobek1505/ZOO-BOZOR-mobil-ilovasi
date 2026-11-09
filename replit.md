# ZOO-BOZOR

O‘zbek tilidagi, hayvonlar e’lonlari va uy hayvonlari mahsulotlari uchun mobil ilova.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

_Populate as you build — short repo map plus pointers to the source-of-truth file for DB schema, API contracts, theme files, etc._

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

- Authentication is Firebase, as explicitly approved by the user. Preserve native mobile and web support. Clerk remains a read-only legacy user directory during migration, not an active login provider; do not restore Clerk middleware or frontend providers when merging older work.
- Marketplace ownership uses stable application account IDs, not raw Firebase UIDs. A verified Firebase email can link to a verified legacy account; persist that mapping and preserve existing local storage namespaces and listing ownership. Never link accounts from an unverified email or client-supplied profile fields.
- Protected API routes must verify Firebase bearer tokens and obtain the canonical account ID through the shared Firebase authentication middleware. Reconcile older task branches that still call Clerk `getAuth()` before enabling their routes.
- Do not delete legacy accounts or the server-side directory credentials during migration. Old passwords cannot be copied; existing users register once with the same email in Firebase and verify it, or use Google with that verified email.

## Product

- The user chose a native mobile app, not a browser-only web app.
- Source of visual truth: the user's ZOO-BOZOR Figma design, file key `8CDKhxn3Jozy83aPQ6m8kV`. Reproduce its screens and original imagery faithfully rather than inventing a new visual direction.
- External services (real authentication, SMS, message delivery, payments) must never be represented as connected or successful until actually integrated.

## User preferences

- Communicate in Uzbek with correct spelling.
- Preserve the supplied Figma design as closely as possible.

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
