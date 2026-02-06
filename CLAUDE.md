# CLAUDE.md - AnyDayCard

AI-powered personalized greeting cards with a wizard flow that captures recipient details to generate meaningful messages.

For agent workflow and compounding notes, see `AGENTS.md` and `/.codex/`.

## Build Commands

```bash
npm install        # Install dependencies
npm run dev        # Start dev server
npm run build      # Production build
npm run lint       # ESLint
```

---

## ⚠️ CORE PRODUCT ARCHITECTURE (READ THIS FIRST)

**AnydayCard = Pre-designed templates + AI-generated text. NOT AI-generated artwork.**

```
┌─────────────────────────────────────────────────────────────────┐
│  PRE-DESIGNED CARD TEMPLATES (static artwork)                   │
│  - Professional designs created by humans                       │
│  - Defined in src/app/create/constants.ts                       │
│  - This is our design differentiation / brand identity          │
└─────────────────────────────────────────────────────────────────┘
                              +
┌─────────────────────────────────────────────────────────────────┐
│  AI-GENERATED TEXT MESSAGE (personalized via ADC)               │
│  - Wizard collects: name, relationship, occasion, vibe, traits  │
│  - ADC Foundation Model composes the prompt                     │
│  - Gemini generates the message                                 │
│  - This is our personalization moat                             │
└─────────────────────────────────────────────────────────────────┘
                              =
┌─────────────────────────────────────────────────────────────────┐
│  FINAL CARD (template + message)                                │
│  - Digital: delivered via email                                 │
│  - Physical: printed and shipped via Lob                        │
└─────────────────────────────────────────────────────────────────┘
```

**Why this architecture:**
- **Consistent quality:** Pre-designed templates guarantee print-ready, brand-aligned output
- **AI where it matters:** Text personalization is where AI adds real value
- **Design differentiation:** Our templates are our brand; AI-generated art would commoditize this
- **Reliable fulfillment:** Static templates work predictably with Lob print API

**DO NOT:**
- Build AI image generation features
- Generate card artwork dynamically
- Replace templates with AI-generated designs

**DO:**
- Improve the ADC Foundation Model for better text generation
- A/B test prompt strategies (v1 vs v2)
- Add more pre-designed card templates
- Enhance the wizard to collect better personalization data

---

## Product Overview

**Core flow:** Occasion → Recipient → Questions → Template → AI Message → Preview → Checkout

The wizard collects personalization data (name, relationship, occasion, vibe, traits) and generates AI-powered messages tailored to each recipient. Cards can be purchased as digital downloads or print-and-ship.

**Note:** The `/stamps` route is a placeholder/showcase feature. The real product is the card wizard at `/create`.

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Homepage |
| `/create` | **Core product** - Wizard flow for card personalization |
| `/card` | Card gallery |
| `/card/[slug]` | Individual card detail |
| `/shop` | Shopping cart |
| `/shop/checkout` | Checkout flow |
| `/shop/checkout/success` | Order confirmation |
| `/stamps` | Placeholder/showcase (not core product) |
| `/about` | About page |

## Architecture

```
src/app/
├── create/                   # Core product - wizard flow
│   ├── wizard/              # Wizard components
│   │   ├── WizardShell.tsx  # Main wizard container
│   │   ├── questions.ts     # Question configs & step logic
│   │   ├── AnswerSummary.tsx
│   │   └── inputs/          # Input components (GridSelect, TextInput, etc.)
│   ├── components/          # Card display
│   │   ├── CanvasGrid/      # Card grid display
│   │   └── MetadataTable/
│   ├── constants.ts         # Card definitions
│   ├── models.ts            # Types (WizardStep, Card, WizardAnswers)
│   └── page.tsx
├── (main)/                  # Landing pages & shop
│   ├── card/               # Card gallery & detail pages
│   ├── shop/               # Cart, checkout, success
│   └── components/         # Shared UI (ThemeSwitcher, etc.)
├── api/                     # API routes
│   ├── generate/           # AI message generation v1 (Gemini)
│   ├── generate-v2/        # AI message generation v2 (A/B testing)
│   ├── analytics/events/   # A/B testing event logging
│   ├── checkout/session/   # Stripe checkout session creation
│   ├── webhooks/stripe/    # Stripe webhook handler
│   ├── feedback/
│   ├── analytics/
│   ├── sketches/
│   └── stats/
└── stamps/                  # Placeholder/showcase (not core product)
```

## Key Files

| Purpose | Location |
|---------|----------|
| Wizard questions & step logic | `src/app/create/wizard/questions.ts` |
| Card wizard component | `src/app/create/components/CardWizard.tsx` |
| Type definitions | `src/app/create/models.ts` |
| Card template definitions | `src/app/create/constants.ts` |
| AI message generation v1 | `src/app/api/generate/route.ts` |
| AI message generation v2 | `src/app/api/generate-v2/route.ts` |
| ADC v2 system prompt | `src/lib/adc/v2/prompts/text.ts` |
| A/B testing (cohort assignment) | `src/lib/ab-testing.ts` |
| Analytics (event tracking) | `src/lib/analytics.ts` |
| Stripe checkout | `src/app/api/checkout/session/route.ts` |
| Stripe webhooks | `src/app/api/webhooks/stripe/route.ts` |
| Stripe client | `src/lib/stripe.ts` |
| Input components | `src/app/create/wizard/inputs/` |

## Tech Stack

- **Framework:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **State:** Zustand
- **Payments:** Stripe (checkout sessions + webhooks)
- **AI:** Google Gemini (message generation via `@google/generative-ai`)
- **Database:** Supabase
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

## ADC Foundation Model (Text Generation)

The **ADC (AnydayCard) Foundation Model** is our versioned prompt composition system. It's where the craft lives.

```
src/lib/adc/
├── index.ts              # Exports current version + v1/v2 namespaces
├── types.ts              # GenerationInput, Vibe, HumorType, etc.
├── v1/                   # Version 1: Concatenation approach
│   ├── compose.ts        # Composition engine
│   ├── components/       # tones, traits, occasions
│   └── prompts/text.ts   # Prompt builder
└── v2/                   # Version 2: Composition-aware system prompt
    └── prompts/text.ts   # System prompt + user message builder
```

**v1 vs v2 Architecture:**

| Aspect | v1 (Concatenation) | v2 (Composition-Aware) |
|--------|-------------------|------------------------|
| Approach | Hand-coded rules concatenated into prompt | System prompt teaches Gemini composition rules |
| Prompt structure | Single user message | `systemInstruction` + user message |
| Tone blending | Explicit conditionals | Gemini reasons about how tones interact |
| Endpoint | `/api/generate` | `/api/generate-v2` |
| Version | `1.0.x` | `2.0.x` |

## A/B Testing Infrastructure

Users are randomly assigned to cohorts for comparing v1 vs v2 text generation.

**How it works:**
1. First visit → 50/50 random assignment to `v1` or `v2` (stored in localStorage)
2. Message generation → routes to appropriate endpoint based on cohort
3. All events tagged with `cohort` + `version` for analysis

**Key files:**
- `src/lib/ab-testing.ts` — Cohort assignment, endpoint selection
- `src/lib/analytics.ts` — Event tracking with cohort tags
- `src/app/api/analytics/events/route.ts` — Server-side event logging

**Events tracked:**
- `adc_message_generated` — First generation
- `adc_message_regenerated` — User clicked regenerate (with count)
- `adc_checkout_started` — Began checkout
- `adc_purchase_completed` — Successful purchase

**Testing locally:**
```javascript
// Force cohort (browser console)
localStorage.setItem('adc_cohort', 'v2')  // or 'v1'
localStorage.getItem('adc_cohort')         // check current

// Disable A/B testing (use v2 for everyone)
// Set NEXT_PUBLIC_AB_TESTING_ENABLED=false in .env.local
```

**Success metrics:**
- Regeneration rate ↓ (v2 should be lower = users happier with first result)
- Conversion rate ↑ (or at least no regression)
- Time-to-checkout ↓ (no added friction)

## External Integrations

**Active:**
- **AI:** Google Gemini (`gemini-2.0-flash` for text generation)
- **Payments:** Stripe (checkout + webhooks configured)
- **Database:** Supabase (orders table)
- **Analytics:** Umami (with A/B cohort tagging)

**Planned:**
- **Print Fulfillment:** Lob API (keys in `.env.local`)
- **Email:** SendGrid (for digital card delivery)

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

---

## Context Persistence Protocol

**How new Claude Code sessions stay up to date:**

1. **This file (CLAUDE.md)** is auto-loaded when starting Claude Code in this directory
2. **Update the "Current Status" section below** at end of each session with:
   - What was accomplished
   - What's in progress
   - Known issues or blockers
3. **Commit CLAUDE.md changes** so context persists across machines/sessions

**Starting a new session:**
```bash
cd ~/Projects/anyday-card && claude
```

Claude automatically reads this file — no need for `git status` to "sync" context.

---

## Current Status

**Last updated:** 2026-01-23

**Recent changes:**
- **ADC Foundation Model v2.0 implemented** — composition-aware system prompt
  - v2 uses `systemInstruction` parameter to teach Gemini tone blending, trait integration, relationship awareness
  - Current version: `2.0.6` with extensive composition rules
- **A/B Testing Infrastructure complete**
  - 50/50 cohort split between v1 and v2
  - Event tracking with cohort + version tags
  - CardWizard routes to correct endpoint based on cohort
- **Clarified product architecture** — templates + AI text (no AI image generation)

**Completed features:**
- Wizard flow at `/create` (name, relationship, occasion, vibe, traits)
- AI message generation v1 (concatenation) + v2 (composition-aware)
- A/B testing with analytics tracking
- Card gallery at `/card`
- Shopping cart and Stripe checkout
- Webhook handler saves orders to Supabase
- Lob fulfillment for physical cards
- $2 customization fee for personalized cards

**Next up:**
- Run A/B test and analyze v1 vs v2 performance
- Email delivery for digital cards (SendGrid integration)
- Production deployment checklist

**Known issues:**
- Pre-existing type error in `src/app/api/webhooks/stripe/route.ts:161` (variant type)
- `Libertinus Serif` font fallback warning (cosmetic)

**Local development:**
```bash
npm run dev                    # Start Next.js dev server
stripe listen --forward-to localhost:3000/api/webhooks/stripe  # Webhook testing
```
