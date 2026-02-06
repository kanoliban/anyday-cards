# Research Runbook (High-Recall Diligence)

Use for unfamiliar or risky work.

1. Identify entry points.
- Grep for route/component names.
- Find the top-level owner file(s) and trace imports/callers.

2. Build a minimal repo map.
- List the 3-7 files that actually govern behavior.
- Note environment variables involved.

3. Enumerate risks and invariants.
- Payments, auth, persistence, deploy pipeline, analytics.

4. Produce an evidence summary.
- Include file paths and what you observed.
- Call out unknowns explicitly.

5. Propose a plan with options.
- Include a recommended option with rationale and downside.

