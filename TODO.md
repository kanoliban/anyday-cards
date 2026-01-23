# AnyDayCard TODO

## Next Up

### External Service Configuration
- [ ] **Lob Integration Testing** — Test physical card fulfillment with live Lob API credentials
- [ ] **SendGrid Setup** — Configure SendGrid for digital card email delivery
- [ ] **Supabase Verification** — Verify orders table population via live webhook

### Post-Checkout UX
- [ ] **Cart Clear Verification** — Confirm cart clears after successful Stripe redirect
- [ ] **Success Page Polish** — Review `/shop/checkout/success` messaging and order confirmation display

---

## Completed (2025-01-22)

### E2E Purchase Flow Testing
- [x] Test 1: Physical Card (Happy Path) — Wizard → Cart → Stripe with shipping
- [x] Test 2: Digital Card (Happy Path) — Wizard → Cart → Stripe without shipping
- [x] Test 3: Mixed Order (Physical + Digital) — Both variants in single checkout
- [x] Test 4: Customization Fee — Verified +$2 applied correctly ($3.99 → $5.99)
- [x] Test 5: Error Handling — Empty cart, invalid card ID, malformed requests

### Bug Fixes
- [x] **Stripe metadata 500 error** — Split metadata across keys to avoid 500 char/key limit
  - Commit: `89c4562`
  - Files: `src/app/api/checkout/session/route.ts`, `src/app/api/webhooks/stripe/route.ts`

---

## Notes

**Test artifacts location:**
```
/private/tmp/claude/.../scratchpad/screenshots/
├── mixed_final/    # Test 3 screenshots
├── customization/  # Test 4 screenshots
└── errors/         # Test 5 screenshots
```

**Stripe test card:** `4242 4242 4242 4242` (any future exp, any CVC)

**Webhook testing:**
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```
