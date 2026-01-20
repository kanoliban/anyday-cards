# CLAUDE.md - AnyDayCard

AI-powered personalized greeting cards with a wizard flow that captures recipient details to generate meaningful messages.

## Build Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # ESLint
```

## Product Overview

**Core flow:** Occasion → Recipient → Questions → Template → AI Message → Preview → Checkout

The wizard collects personalization data (name, relationship, occasion, vibe, traits) and generates AI-powered messages tailored to each recipient. Cards can be purchased as digital downloads or print-and-ship.

**Note:** The `/stamps` route is a placeholder/showcase feature. The real product is the card wizard at `/cards`.

## Architecture

```
src/app/
├── cards/                    # Core product
│   ├── wizard/              # Wizard flow components
│   │   ├── WizardShell.tsx  # Main wizard container
│   │   ├── questions.ts     # Question configs & step logic
│   │   ├── AnswerSummary.tsx
│   │   └── inputs/          # Input components (GridSelect, TextInput, etc.)
│   ├── components/          # Card display & purchase
│   │   ├── Stamps/          # Card grid display
│   │   └── MetadataTable/
│   ├── models.ts            # Types (WizardStep, Card, WizardAnswers)
│   └── page.tsx
├── (main)/                  # Landing pages
│   ├── shop/               # Shop components, CartDrawer
│   └── components/         # Shared UI (ThemeSwitcher, etc.)
├── api/                     # API routes
│   ├── feedback/
│   ├── sketches/
│   └── analytics/
└── stamps/                  # Placeholder/showcase (not core product)
```

## Key Files

| Purpose | Location |
|---------|----------|
| Wizard questions & step logic | `src/app/cards/wizard/questions.ts` |
| Wizard shell | `src/app/cards/wizard/WizardShell.tsx` |
| Type definitions | `src/app/cards/models.ts` |
| Card data display | `src/app/cards/components/Stamps/` |
| Input components | `src/app/cards/wizard/inputs/` |

## Tech Stack

- **Framework:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **State:** Zustand
- **Payments:** Stripe
- **AI:** Anthropic Claude SDK (message generation)
- **Database:** Supabase + Kysely
- **Animation:** Framer Motion
- **UI:** Radix primitives

## Wizard Flow

Steps defined in `questions.ts`:
1. `name` — Recipient's name (text input)
2. `relationship` — Who they are (grid select)
3. `occasion` — What's the occasion (grid select)
4. `vibe` — Tone of card (multi-select, max 2)
5. `humorType` — Type of humor (conditional, if vibe=funny)
6. `heartfeltDepth` — How deep (conditional, if vibe=heartfelt only)
7. `quickTraits` — Personality chips (optional)
8. `preview` — Generated message + card selection

Conditional logic via `showIf` functions. Navigation via `getNextStep`/`getPrevStep`.

## External Integrations (planned)

- **Print Fulfillment:** Lob API
- **Email:** SendGrid
- **Analytics:** PostHog, Umami

## PRD Reference

Full product spec at:
`~/Desktop/Desktop/A Very Serious Company/AnyDay Card/PRD/`

Use the PRD for detailed feature specs, user flows, and business requirements.

## Development Notes

- Follow existing Tailwind patterns
- Use Zustand for wizard state
- Match wizard input component patterns in `wizard/inputs/`
- Card pricing: physical + digital variants with USD currency
- Wizard answers typed as `WizardAnswers` interface
