<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Frontend Project Instructions

## Scope

- This is the SIMAS UNAND frontend in `frontend_PABF/`.
- Use the Next.js App Router structure under `src/app/`.
- Keep route groups such as `(auth)` and `(dashboard)` intact; do not rename them without updating navigation and layouts.

## Stack and conventions

- Use TypeScript and React Server Components by default. Add `"use client"` only for components that need browser APIs, state, effects, or event handlers.
- Follow the existing component organization: shared UI in `src/components/`, API access in `src/lib/` or `src/services/`, reusable hooks in `src/hooks/`, and shared types in `src/types/`.
- Use the existing `apiClient`/`api` wrapper for backend requests. Do not call `fetch` directly from pages when the wrapper can handle authentication and error behavior.
- Keep user-facing text in Indonesian unless the surrounding feature already uses another language.
- Preserve the existing visual language, responsive behavior, accessibility, and role-specific dashboard flows for mahasiswa and fasilitator.
- Keep secrets and backend credentials out of client code. Only expose deliberately public values through `NEXT_PUBLIC_*` environment variables.

## Validation

- From this directory, run `npm run lint` for lint checks and `npm run build` when changes affect routing, types, metadata, or production behavior.
- Before changing Next.js behavior, read the relevant documentation in `node_modules/next/dist/docs/` as required by the generated rules above.
- Prefer focused validation for the touched route or component before broad checks.
