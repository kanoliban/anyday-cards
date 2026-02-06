# Implementation Runbook

1. Confirm definition of done.
2. Make the smallest change that achieves it.
3. Add or update tests when feasible; otherwise document manual verification steps.
4. Run:
- `npm run lint`
- `npm run build`
5. Verify primary flows affected (often `/create` wizard, plus checkout for purchase changes).
6. Persist context:
- Update `CLAUDE.md` "Current Status" if meaningful.
- Add any durable learnings to `.codex/memory.md`.

