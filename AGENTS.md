# AGENTS.md - AnyDayCard

This file defines how agents should operate in this repo: high leverage, low context-switching, and compounding knowledge over time.

## Read First (Source Of Truth Order)
1. Code is the source of truth.
2. `/Users/libankano/Desktop/A Very Serious Company/anyday-card/CLAUDE.md` is the product architecture + repo map.
3. Other docs are helpful but may drift; validate important facts in code.

## Non-Negotiables (Product Architecture)
AnyDayCard = pre-designed card templates + AI-generated text. NOT AI-generated artwork.
If a request seems to push toward AI-generated designs/artwork, stop and propose alternatives that preserve template-first differentiation.

## Operating Principles (From The "Ask" Article)
- Prefer simple tooling over fancy tooling (worktrees + shell windows + editor).
- Spend tokens on diligence when mistakes are expensive.
- Use agents as high-recall search + synthesis, not just "code autocomplete".
- Orchestrate: one primary agent can delegate to subagents, then synthesize.
- Compound: capture stable learnings (runbooks, checklists, repo gotchas) so future sessions get faster.

## Collaboration Style (This User)
- Do not assume the user is correct; verify with code and concrete evidence.
- The user can jump contexts; keep a "home base" and actively re-anchor.
- Prefer proposing options (with a recommendation) over asking open-ended questions.
- Only block when truly necessary; otherwise proceed with the best default and state assumptions.

## Default Workflow ("Home Base")
For any task that is more than a quick one-liner, maintain a short running header internally:
- Goal
- Current state (what's true in code right now)
- Plan (next 1-3 actions)
- Definition of done

If the user changes direction, explicitly confirm whether to:
- Switch goals, or
- Park the new idea in notes and finish the current goal.

## Research Mode (High-Recall Diligence)
Use this when:
- You're unfamiliar with the code area.
- The change is risky (payments, auth, data, deployments).
- The user asks for "best approach" or "second opinion".

Steps:
1. Search the codebase for the entry points and call sites.
2. Read adjacent docs and configs, but verify key claims in code.
3. Identify invariants, edge cases, and failure modes.
4. Produce a short evidence-based summary with file paths and what you observed.
5. Only then propose/implement changes.

## Implementation Mode (Make Changes Safely)
- Prefer small, reviewable diffs.
- Keep behavior changes covered by either tests or explicit manual verification steps.
- Run at least:
  - `npm run lint`
  - `npm run build`
- For UI flows, verify the core route(s) impacted (often `/create` for wizard changes).

## Context Persistence (Compounding Improvement)
Stable knowledge must be committed to git so it compounds across machines/sessions.

Primary places:
- `/Users/libankano/Desktop/A Very Serious Company/anyday-card/CLAUDE.md`
  - Keep "Current Status" reasonably up to date when meaningful progress is made.
- `/Users/libankano/Desktop/A Very Serious Company/anyday-card/.codex/memory.md`
  - Short, factual "what we learned" notes and repo gotchas.
- `/Users/libankano/Desktop/A Very Serious Company/anyday-card/.codex/runbooks/`
  - Repeatable checklists and procedures.

Do not commit:
- Secrets, API keys, tokens, credentials.
- Customer PII or private internal data dumps.
- Raw long logs/transcripts.

Scratch space:
- Put ephemeral logs/scratch in `/.codex/logs/` or `/.codex/tmp/` (gitignored).

## When Blocked
If you can't access required context (credentials, external docs, environment), do:
- State exactly what is missing.
- Provide a best-effort plan that can proceed once unblocked.
- List the minimum inputs needed to continue.

