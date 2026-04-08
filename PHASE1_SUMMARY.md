# PetSOS — Phase 1 Full Summary

**Last updated:** April 2026
**Production URL:** https://petsos.site
**Platform:** Web app (React/Vite + Express) + Capacitor mobile (iOS/Android)

---

## What is PetSOS?

PetSOS is an emergency veterinary care coordination platform for Hong Kong pet owners. When a pet has a medical emergency, the owner opens the app, describes the symptoms, shares their GPS location, and PetSOS instantly broadcasts a WhatsApp message to all nearby 24-hour veterinary hospitals simultaneously. Hospitals reply in real time and the owner sees which hospitals can accept their pet — all within seconds.

---

## Phase 1: Core Emergency Loop

Phase 1 covers exactly one user journey end-to-end: **pet owner in crisis → nearest available hospital**. Everything else is Phase 2.

> Note: No account creation required to use the emergency flow. `/signup`, `/login`, `/pets`, `/profile` are Phase 2.

### The 6-Step Flow

```
① DISCOVER → ② INTAKE → ③ BROADCAST → ④ LIVE RESULTS → ⑤ OWNER ACTS → ⑥ ADMIN REVIEW
```

| Step | What happens | Pages involved |
|------|-------------|----------------|
| **① Discover** | Owner finds PetSOS — no account required. Can browse hospital directory before starting an emergency | `/`  `/clinics`  `/hospitals/:slug` |
| **② Emergency Intake** | AI-assisted 3-step form: symptoms (+ voice) → GPS location → contact info | `/emergency` |
| **③ Broadcast** | System sends WhatsApp template message to all nearby 24h hospitals simultaneously | *(backend only — messaging service)* |
| **④ Live Results** | Hospital replies appear as colour-coded cards in real time (30-min reply window) | `/emergency-results/:id` |
| **⑤ Owner Acts** | Owner calls or heads directly to the accepting hospital | `/clinics`  `/hospitals/:slug` |
| **⑥ Admin Review** | Daily email report at 08:00 HKT — previous day split into 3 × 8-hour periods with case details, location, response rates | `/admin`  `/admin/analytics` |

---

## WhatsApp Layer (the core engine)

WhatsApp is how the system communicates with hospitals. There are three distinct parts:

### Outbound (App → Hospital)
- PetSOS calls the **Meta Cloud API** with an approved message template
- Language is auto-selected: **English** or **Traditional Chinese (ZH-HK)**
- Template tier depends on data available: **basic** / **new** / **full** (6 templates total)
- Sent to the hospital's registered WhatsApp Business number

### Webhook (Meta → petsos.site)
- When a hospital replies, Meta immediately calls: `POST https://petsos.site/api/webhooks/whatsapp`
- Verification endpoint: `GET /api/webhooks/whatsapp` (uses `WHATSAPP_WEBHOOK_VERIFY_TOKEN`)
- The server matches the reply to the correct open emergency using a **30-minute active window**
- After 30 minutes, replies are logged but no longer auto-linked to an emergency

### Inbound (Hospital → App)
| Hospital replies | System detects | Card shown to owner |
|-----------------|---------------|---------------------|
| `1` | `can_accept` | ✅ Green — Can Accept |
| `2` | `full` | ❌ Red — At Capacity |
| `3` | `call_requested` | 📞 Yellow — Please Call First |
| Anything else | `other` | Flagged in admin log for manual review |

---

## Pages in Phase 1 Scope

### Public (no login required)
| Page | Purpose |
|------|---------|
| `/` | Landing page — app store landing, hero, CTA |
| `/signup` | Create account |
| `/login` | Sign in (email/password + Google OAuth) |
| `/emergency` | AI emergency intake form (3 steps) |
| `/emergency-results/:id` | Live hospital response cards |
| `/clinics` | Clinic directory with search and filter |
| `/hospitals` | Hospital listing |
| `/hospitals/:slug` | Hospital detail — hours, fees, address, directions |
| `/privacy` | Privacy policy (required for App Store) |
| `/terms` | Terms of service (required for App Store) |
| `/about` | About PetSOS |
| `/faq` | Frequently asked questions |

### Authenticated (login required)
| Page | Purpose |
|------|---------|
| `/pets` | Add, edit, delete pet profiles |
| `/profile` | Update name, phone number, preferences |

### Admin (admin login + 2FA required)
| Page | Purpose |
|------|---------|
| `/admin` | Dashboard — live emergencies, broadcast stats |
| `/admin/hospitals` | Manage hospital directory and WhatsApp numbers |
| `/admin/diagnostics` | Verify WhatsApp credentials, test sends, check template status |
| `/admin/messages` | View all inbound hospital replies |
| `/admin/analytics` | Broadcast volume and response rate charts |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS + shadcn/ui |
| Backend | Express.js (Node) on Render (always-on, no cold starts) |
| Database | PostgreSQL via Neon + Drizzle ORM |
| Auth | Firebase Authentication |
| Messaging | WhatsApp Business Cloud API (Meta) |
| AI | OpenAI (symptom voice transcription and parsing) |
| Geocoding | GPS → readable HK address |
| Mobile | Capacitor (iOS + Android) |
| CDN / SSL | Cloudflare |
| CI/CD | GitHub → Render auto-deploy |

---

## Current Blocking Items (must fix before launch)

These 4 items are blocking the WhatsApp loop from working in production:

### 1. WHATSAPP_WEBHOOK_VERIFY_TOKEN missing on Render
**Fix:** Go to Render dashboard → your PetSOS service → Environment → Add:
```
WHATSAPP_WEBHOOK_VERIFY_TOKEN = petsos-webhook-2026
```
Then go to Meta App Dashboard and click "Verify and save" on the webhook URL.

### 2. WHATSAPP_ACCESS_TOKEN expired (expired Dec 2025)
**Fix:** Meta Business Settings → System Users → Generate New Token
- Set expiry: **Never**
- Permissions: `whatsapp_business_messaging` + `whatsapp_business_management`
- Paste the new token into Render environment variables

### 3. Six WhatsApp templates need creation and Meta approval
**Fix:** Go to Meta Business Manager → Message Templates → Create each:
- `emergency_pet_alert_basic_en`
- `emergency_pet_alert_basic_zh_hk`
- `emergency_pet_alert_new_en`
- `emergency_pet_alert_new_zh_hk`
- `emergency_pet_alert_full_en`
- `emergency_pet_alert_full_zh_hk`

Approval typically takes 24–48 hours. Submit these immediately.

### 4. GitHub → Render auto-deploy not yet connected
**Fix:** Render dashboard → PetSOS service → Settings → Git → Connect to GitHub repo (`PetSOS-teamsite/petsos`) → Enable auto-deploy on push to `main`

---

## Deployment Architecture

```
Developer edits in Replit
        ↓
Push to GitHub (via Replit Version Control panel)
        ↓
Render auto-deploys to petsos.site
        ↓
Capacitor mobile app calls petsos.site API
```

- **petsos.site** stays on Render — always-on, no cold starts (critical for emergency app)
- Replit is the development environment only
- Mobile app (Capacitor) points to `https://petsos.site` as its API base

---

## What is NOT in Phase 1

| Feature | Phase |
|---------|-------|
| Hospital owner self-service portal | Phase 2 |
| Clinic owner dashboard (`/clinic/dashboard`) | Phase 2 |
| Blog and long-form SEO content | Phase 2 |
| Push notification composer (admin) | Phase 2 |
| District vet guides (`/district/:code`) | Phase 2 |
| Advanced analytics and reporting | Phase 2 |
| In-app chat with hospitals | Phase 3 |
| Subscription / payment features | Phase 3 |

---

## Definition of Done for Phase 1

Phase 1 is complete when:
1. A pet owner can complete the full emergency flow on a real device (symptom → GPS → contact → results)
2. At least one hospital WhatsApp number receives the broadcast message
3. A hospital reply of "1", "2", or "3" updates the result card in real time
4. The iOS and Android builds pass App Store / Play Store review
5. All blocking items above are resolved and verified in `/admin/diagnostics`
