# Beyond Rasooli — Technical Handover & Ownership Documentation

## 1. Ownership & Governance Principle
All production accounts, domains, databases, repository access, and cloud credentials must be registered to and owned by the founder (**Abdul Majeed Rasooli**). The engineering agent acts as a collaborator and implementation specialist.

---

## 2. Third-Party Services & Recurring Fees Inventory

| Service | Purpose | Recommended Plan | Estimated Monthly Fee | Owner |
|---|---|---|---|---|
| **Domain Registrar** (Cloudflare / Namecheap) | `beyondrasooli.com` domain registration | Annual registration | ~$1.20 / mo ($14/yr) | Founder |
| **Hosting Platform** (Vercel / Railway) | Next.js App Router server & edge delivery | Pro / Starter | $0 – $20 / mo | Founder |
| **Database** (Neon / Supabase / Railway) | Managed PostgreSQL (with automated daily backup) | Free / Starter | $0 – $10 / mo | Founder |
| **Media Storage** (Cloudflare R2) | S3-compatible media bucket (zero egress fees) | Free tier (10 GB free) | $0 / mo | Founder |
| **Email Delivery** (Resend) | Contact form transactional notifications | Free tier (3,000 emails/mo) | $0 / mo | Founder |
| **Spam Protection** (Cloudflare Turnstile) | Invisible CAPTCHA for contact form | Free tier | $0 / mo | Founder |
| **Analytics** (Plausible / Umami) | Privacy-friendly, cookieless analytics | Self-hosted or Cloud | $0 – $9 / mo | Founder |
| **Translation API** (Anthropic Claude API) | P1 translate-at-publish server adapter | Pay-as-you-go (capped at $50/mo) | Variable ($5 – $25/mo) | Founder |

*Total baseline operational cost:* **~$0 to $35 / month** (well within typical lean media publication budget).

---

## 3. Account Ownership Transfer Checklist

- [ ] **GitHub Repository:** Transferred or owned by founder's primary GitHub account.
- [ ] **DNS & Domain Nameservers:** Pointed to Cloudflare / hosting provider under founder account.
- [ ] **Hosting Account:** Registered under `admin@beyondrasooli.com`.
- [ ] **Database Credentials:** Secrets stored in secure `.env` on hosting environment.
- [ ] **Payload CMS Admin:** Master founder account `admin@beyondrasooli.com` active with strong password.
- [ ] **Google Search Console & Analytics:** Verified under founder's Google account.

---

## 4. Production Deployment Instructions

### Option A: Vercel Deployment (Recommended)
1. Push codebase to founder's GitHub repository.
2. In Vercel, click **Import Project** and select `beyond-rasooli`.
3. Add Environment Variables from `.env.example`:
   - `DATABASE_URI` (Neon/Supabase Postgres connection string)
   - `PAYLOAD_SECRET` (generate 32+ character random secret)
   - `NEXT_PUBLIC_SERVER_URL` (`https://beyondrasooli.com`)
   - `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CLOUDFLARE_TURNSTILE_SECRET_KEY`
4. Deploy! Vercel automatically runs `npm run build` and distributes the application globally.

### Option B: Self-Hosted / Railway / Docker
1. Ensure Node.js 22+ and PostgreSQL are installed.
2. Clone repository and run `npm install`.
3. Copy `.env.example` to `.env` and set production credentials.
4. Run `npm run seed` to initialize database topics, legal scaffolds, and UI strings.
5. Run `npm run build` followed by `npm run start`.

---

## 5. Post-Launch Bug-Fix Period & Maintenance
- **Stabilization Window:** 90 days following initial deployment.
- **Coverage:** Resolving runtime defects, layout regressions, RTL rendering anomalies, or font fallback glitches identified in Search Console or Sentry.
- **Maintenance Schedule:** Monthly dependency updates and quarterly disaster recovery drill.
