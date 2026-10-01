@AGENTS.md

The rules in `AGENTS.md` are authoritative for this frontend. In addition:

- Inspect nearby components and existing route patterns before introducing a new abstraction.
- Keep changes focused and avoid changing generated `.next/` output or dependency lockfiles unless the task requires it.
- When changing API contracts, verify the matching backend route and update shared frontend types and error handling together.
- Run the narrowest relevant check first, then `npm run lint` or `npm run build` as appropriate.
