# PetSOS — Dev Team Pre-Launch Checklist

## How to use
Work through each section in order. Items marked **[BLOCKING]** must pass before moving to the next section.
Check off each item as you verify it. Note any failures with a date and who checked.

---

## 1. Environment & Secrets [BLOCKING]

Run `/admin/diagnostics` in the app to verify WhatsApp credentials automatically.

| # | Check | Where to verify | Pass? |
|---|-------|----------------|-------|
| 1.1 | `WHATSAPP_ACCESS_TOKEN` is set and **not expired** | Render env vars + Admin Diagnostics page | ☐ |
| 1.2 | `WHATSAPP_PHONE_NUMBER_ID` is set | Render env vars | ☐ |
| 1.3 | `WHATSAPP_BUSINESS_ACCOUNT_ID` is set | Render env vars | ☐ |
| 1.4 | `WHATSAPP_WEBHOOK_VERIFY_TOKEN=petsos-webhook-2026` is set | Render env vars | ☐ |
| 1.5 | `DATABASE_URL` connected to Neon PostgreSQL | Render env vars | ☐ |
| 1.6 | `OPENAI_API_KEY` set (for AI voice analysis) | Render env vars | ☐ |
| 1.7 | Firebase Admin SDK credentials set | Render env vars | ☐ |
| 1.8 | GitHub → Render auto-deploy is enabled | Render dashboard → Settings | ☐ |

---

## 2. WhatsApp / Meta Setup [BLOCKING]

| # | Check | How to test | Pass? |
|---|-------|-------------|-------|
| 2.1 | Webhook verified in Meta: `https://petsos.site/api/webhooks/whatsapp` | Meta App Dashboard → Webhooks | ☐ |
| 2.2 | Webhook subscribed to `messages` field | Meta App Dashboard → Webhooks | ☐ |
| 2.3 | Template `emergency_pet_alert_basic_en` — APPROVED | Meta Business Manager → Message Templates | ☐ |
| 2.4 | Template `emergency_pet_alert_basic_zh_hk` — APPROVED | Meta Business Manager → Message Templates | ☐ |
| 2.5 | Template `emergency_pet_alert_new_en` — APPROVED | Meta Business Manager → Message Templates | ☐ |
| 2.6 | Template `emergency_pet_alert_new_zh_hk` — APPROVED | Meta Business Manager → Message Templates | ☐ |
| 2.7 | Template `emergency_pet_alert_full_en` — APPROVED | Meta Business Manager → Message Templates | ☐ |
| 2.8 | Template `emergency_pet_alert_full_zh_hk` — APPROVED | Meta Business Manager → Message Templates | ☐ |
| 2.9 | Free-text test message sends from `/admin/diagnostics` | Send to a test number | ☐ |
| 2.10 | Hospital reply "1" → system detects as `can_accept` | Reply "1" from hospital WhatsApp | ☐ |
| 2.11 | Hospital reply "2" → system detects as `full` | Reply "2" from hospital WhatsApp | ☐ |
| 2.12 | Hospital reply "3" → system detects as `call_requested` | Reply "3" from hospital WhatsApp | ☐ |

---

## 3. Emergency Core Flow [BLOCKING]

Test with a real device. Use a test hospital WhatsApp number to receive broadcasts.

| # | Check | Expected result | Pass? |
|---|-------|----------------|-------|
| 3.1 | `/emergency` page loads without errors | Form displays correctly | ☐ |
| 3.2 | AI voice description input works | Transcribes and parses symptoms | ☐ |
| 3.3 | Symptom form submits → moves to step 2 | Location step appears | ☐ |
| 3.4 | GPS location captured (browser + native) | Coordinates captured | ☐ |
| 3.5 | GPS coords convert to readable HK address | Address shown in UI (not raw coords) | ☐ |
| 3.6 | Location submitted → moves to step 3 | Contact step appears | ☐ |
| 3.7 | Contact info submitted → broadcast fires | WhatsApp sent to nearby hospitals | ☐ |
| 3.8 | Broadcast message includes readable address | Check hospital's received WhatsApp | ☐ |
| 3.9 | Message includes quick-reply hint ("Reply 1=Accept / 2=Full / 3=Call us") | Check message body | ☐ |
| 3.10 | `/emergency-results/:id` shows all hospitals contacted | Results page loads | ☐ |
| 3.11 | Hospital replies within 30 min → card updates with color badge | ✅ green / ❌ red / 📞 yellow | ☐ |
| 3.12 | After 30 min window — replies no longer auto-linked | Test with old broadcast | ☐ |

---

## 4. Hospital & Clinic Directory

| # | Check | Expected result | Pass? |
|---|-------|----------------|-------|
| 4.1 | `/clinics` directory loads | List of clinics with search/filter | ☐ |
| 4.2 | Search by name/district works | Filtered results appear | ☐ |
| 4.3 | `/hospitals` listing loads | Hospital cards shown | ☐ |
| 4.4 | `/hospitals/:slug` detail page renders | Full hospital info, hours, fees | ☐ |
| 4.5 | Distance from user shown on cards | GPS-based distance | ☐ |
| 4.6 | 24h open badge shown on 24-hour hospitals | Badge visible | ☐ |
| 4.7 | `/districts` index loads | District list shown | ☐ |
| 4.8 | `/district/:code` guide loads | District vet guide content | ☐ |

---

## 5. User Accounts

| # | Check | Expected result | Pass? |
|---|-------|----------------|-------|
| 5.1 | `/signup` — create account with email | Account created, redirected | ☐ |
| 5.2 | `/login` — sign in | Authenticated, session persists | ☐ |
| 5.3 | Google OAuth login works | One-tap sign in | ☐ |
| 5.4 | `/pets` — add a pet profile | Pet saved with name, species, breed, photo | ☐ |
| 5.5 | `/pets` — edit and delete pet | Changes persist | ☐ |
| 5.6 | `/profile` — update name / phone | Saved successfully | ☐ |
| 5.7 | Clinic owner `/clinic/dashboard` loads | Owner sees their clinic data | ☐ |

---

## 6. Admin Panel

Login at `/admin/login` — requires admin account + 2FA code.

| # | Check | Expected result | Pass? |
|---|-------|----------------|-------|
| 6.1 | `/admin/login` — 2FA works | TOTP code accepted | ☐ |
| 6.2 | `/admin` — dashboard stats load | User count, emergency count, broadcast stats | ☐ |
| 6.3 | `/admin/analytics` — charts render | Usage graphs visible | ☐ |
| 6.4 | `/admin/hospitals` — list, add, edit, delete | CRUD operations work | ☐ |
| 6.5 | `/admin/clinics` — list, add, edit, delete | CRUD operations work | ☐ |
| 6.6 | `/admin/users` — user list loads | All users visible | ☐ |
| 6.7 | `/admin/diagnostics` — all 6 template statuses shown | APPROVED / PENDING / REJECTED | ☐ |
| 6.8 | `/admin/diagnostics` — test send to number works | Message received | ☐ |
| 6.9 | `/admin/messages` — WhatsApp message log | Inbound replies visible | ☐ |
| 6.10 | `/admin/hospital-audit` — field change log | Change history shown | ☐ |
| 6.11 | `/admin/notifications` — push composer | Notification sends successfully | ☐ |

---

## 7. Content & SEO Pages

| # | Check | Expected result | Pass? |
|---|-------|----------------|-------|
| 7.1 | `/` — landing page loads | Hero, CTA, features visible | ☐ |
| 7.2 | `/resources` — loads | Resource list | ☐ |
| 7.3 | `/faq` — loads | FAQ accordion | ☐ |
| 7.4 | `/about` — loads | About content | ☐ |
| 7.5 | `/privacy` — loads | Privacy policy | ☐ |
| 7.6 | `/terms` — loads | Terms of service | ☐ |
| 7.7 | `/typhoon-status` — live HKO data | Current signal shown | ☐ |
| 7.8 | `/emergency-symptoms` — condition guides | 10 condition pages accessible | ☐ |
| 7.9 | `petsos.site/sitemap.xml` — accessible | XML sitemap returned | ☐ |
| 7.10 | `petsos.site/robots.txt` — accessible | robots.txt returned | ☐ |
| 7.11 | OG image shows on link preview (WhatsApp/Telegram share) | Rich preview with image | ☐ |

---

## 8. Infrastructure & Performance

| # | Check | How to test | Pass? |
|---|-------|-------------|-------|
| 8.1 | `petsos.site` SSL certificate valid | Browser padlock / `curl -I https://petsos.site` | ☐ |
| 8.2 | HTTP → HTTPS redirect works | `curl -I http://petsos.site` → 301 | ☐ |
| 8.3 | API response time < 500ms for `/api/clinics` | Browser DevTools → Network | ☐ |
| 8.4 | Render service set to **paid plan** (no cold starts) | Render dashboard | ☐ |
| 8.5 | Database connection pool healthy | `/admin/diagnostics` or Render logs | ☐ |
| 8.6 | GitHub → Render auto-deploy tested | Push a trivial change, verify deploy | ☐ |
| 8.7 | CORS allows mobile app origin | Test API from Capacitor app | ☐ |

---

## 9. Mobile App (Capacitor)

| # | Check | Expected result | Pass? |
|---|-------|----------------|-------|
| 9.1 | iOS build compiles without errors | `npx cap build ios` | ☐ |
| 9.2 | Android build compiles without errors | `npx cap build android` | ☐ |
| 9.3 | GPS permission prompt appears on first use | Native dialog shown | ☐ |
| 9.4 | Microphone permission prompt appears | Native dialog shown | ☐ |
| 9.5 | API calls to `petsos.site` work from native app | Emergency flow completes | ☐ |
| 9.6 | Push notifications delivered (iOS + Android) | Test notification received | ☐ |
| 9.7 | Deep links work (emergency result URL opens in app) | URL opens correct screen | ☐ |

---

## Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Backend Dev | | | |
| Frontend Dev | | | |
| QA | | | |
| Product Owner | | | |

**All items in Sections 1–3 must be ✅ before any public announcement.**
