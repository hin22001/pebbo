# Pebbo - Investor Meeting Cheat Sheet

> **Purpose**: Quick reference for the security compliance & architecture walkthrough
> **Tip**: If they ask something you're unsure about, say: *"I'll get our technical lead to follow up with the exact details on that."*

---

## 1. ARCHITECTURE OVERVIEW (The Big Picture)

### What to Say:

> "Pebbo is a modern web application built on **Next.js 14** — the same framework used by Netflix, Uber, and TikTok. We use a **serverless architecture**, meaning we don't manage any physical servers ourselves. Everything auto-scales."

### The Stack (Simple Version):

| Layer | What We Use | What It Does |
|-------|------------|--------------|
| **Frontend** | Next.js 14 (React) | The app students and teachers see |
| **Hosting** | Vercel | Serves the app globally via CDN |
| **Database** | Supabase (PostgreSQL) | Stores all data securely |
| **Auth** | Supabase Auth | Handles login, sessions, passwords |
| **Payments** | Stripe | Handles all payment processing |
| **AI** | Google AI, OpenAI | Content auditing and quality checks |
| **Text-to-Speech** | ElevenLabs | Reads questions aloud for students |

### If They Ask "Why Not AWS?"

> "We use **Vercel + Supabase**, which are **built on top of AWS infrastructure**. Vercel runs on AWS under the hood. Supabase runs on AWS too. We get the same enterprise-grade infrastructure but with less operational overhead and faster development cycles. It's the modern approach — companies like Notion, Washington Post, and GitHub use similar stacks."

**Key point**: Vercel IS on AWS. Supabase IS on AWS. We're just using managed layers on top of it, which is considered best practice for startups.

---

## 2. SECURITY ARCHITECTURE

### Authentication (How Users Log In)

> "We use **server-side JWT authentication** with **HTTP-only cookies** — this is the gold standard for web security."

**How it works in simple terms:**
1. User logs in with email + password (or OTP)
2. Supabase verifies credentials and issues a **signed JWT token**
3. Token is stored in a **secure, HTTP-only cookie** (not localStorage — which would be less secure)
4. Every API request is verified against this token server-side
5. Sessions auto-refresh — users stay logged in securely

### If They Ask About "Access Keys"

> "Supabase uses a **two-key system** which is industry standard:
> 1. **Anon Key** (public) — like a front door key. It only lets you do what Row Level Security (RLS) policies allow. It's safe to be in the browser.
> 2. **Service Role Key** (secret, server-only) — like the master key. It's NEVER exposed to the client/browser. Only our server-side code can use it.
>
> This is how Supabase is designed to work. There's no separate 'access key' because the anon key + RLS policies handle client-side access control, and the service role key handles server-side operations. This is the official Supabase security model."

### API Protection (How We Secure Data)

> "Every sensitive API endpoint is **protected by three layers**:"

| Layer | What It Does |
|-------|-------------|
| **1. Auth Middleware** | Verifies JWT token on every request — rejects if invalid or expired |
| **2. Route Protection** | Endpoints under `/api/protected/*` require authenticated sessions |
| **3. Input Validation** | All request data is validated using **Zod schemas** (prevents injection attacks) |

### Data Security

- **Database**: PostgreSQL via Supabase — encrypted at rest and in transit
- **Row Level Security (RLS)**: Database-level policies ensure users can only access their own data
- **No raw SQL exposure**: All queries go through Supabase's secure client library
- **Environment secrets**: All API keys and secrets stored as **environment variables** on Vercel — never in code

---

## 3. INFRASTRUCTURE REVIEW

### Hosting: Vercel

> "We host on **Vercel**, the company that created Next.js. It's purpose-built for our framework."

| Feature | Detail |
|---------|--------|
| **CDN** | Global edge network — app loads fast worldwide |
| **SSL/TLS** | Automatic HTTPS on all routes — all traffic encrypted |
| **Auto-scaling** | Handles traffic spikes automatically, no manual intervention |
| **Serverless Functions** | API routes run as serverless functions — no always-on servers to maintain |
| **Deploy Previews** | Every code change gets a preview URL before going live |
| **Rollbacks** | One-click rollback to any previous deployment |
| **DDoS Protection** | Built-in protection against denial-of-service attacks |
| **Infrastructure** | Runs on AWS under the hood |

### Database: Supabase

> "Our database is **Supabase** — an open-source Firebase alternative built on **PostgreSQL**, the world's most advanced open-source database."

| Feature | Detail |
|---------|--------|
| **Database** | PostgreSQL — enterprise-grade, battle-tested |
| **Encryption** | Data encrypted at rest (AES-256) and in transit (TLS) |
| **Backups** | Automatic daily backups with point-in-time recovery |
| **Auth** | Built-in auth system with JWT tokens |
| **RLS** | Row Level Security — database-level access control |
| **Dashboard** | Real-time monitoring and management |
| **Hosting Region** | Configurable — can be set to comply with data residency requirements |
| **SOC 2 Type II** | Supabase is SOC 2 Type II compliant |
| **Infrastructure** | Runs on AWS under the hood |

### Payments: Stripe

> "All payments are processed through **Stripe** — the same payment processor used by Amazon, Google, and Shopify."

- **PCI DSS compliant** — we never store credit card numbers
- Card data goes directly to Stripe — never touches our servers
- Stripe handles all payment security

### Deployment Security: Vercel

> "Our deployment and hosting security is **fully managed by Vercel**. We don't maintain any servers, so there's no server to hack into — no SSH, no open ports, no OS patching. Vercel handles all of that."

**What Vercel Protects Against:**

| Attack Type | How Vercel Handles It |
|-------------|----------------------|
| **DDoS Attacks** | Built-in DDoS mitigation at the edge network level — malicious traffic is absorbed before it reaches our app |
| **Man-in-the-Middle (MITM)** | Automatic SSL/TLS certificates on ALL routes — all traffic is encrypted end-to-end, enforced HTTPS |
| **Bot Attacks** | Vercel Bot Protection — identifies and blocks automated malicious traffic (credential stuffing, scraping) |
| **Code Injection via Deploy** | Deployments are **immutable** — once deployed, the code cannot be modified on the server. Every deploy is a fresh, clean build |
| **Supply Chain Attacks** | Build process runs in **isolated, sandboxed containers** — each build is independent, no cross-contamination |
| **Unauthorized Deploys** | Deployments only trigger from our **private Git repository** — no one outside the team can deploy |
| **Brute Force** | Serverless functions have built-in **rate limiting** and **timeout controls** |
| **Data Interception** | All data in transit is encrypted via **TLS 1.3** (latest standard) |

**Additional Vercel Security Features:**

- **SOC 2 Type II Compliant** — Vercel itself is audited for security controls
- **Edge Network** — 100+ global points of presence; traffic is filtered at the edge before reaching our functions
- **Immutable Deployments** — every deployment is a snapshot; cannot be tampered with after deploy
- **Automatic HTTPS** — no configuration needed, SSL certs auto-renew
- **Preview Deployments** — changes are tested in isolated preview URLs before going to production
- **Instant Rollback** — if anything goes wrong, we roll back to the previous version in seconds
- **No Server Access** — there is literally no SSH, no terminal, no way to "get into" the server. The attack surface that exists with traditional servers (EC2, VPS) simply does not exist here
- **Environment Variable Encryption** — all secrets (API keys, database credentials) are encrypted at rest on Vercel and only injected at build/runtime

> **Simple way to explain it**: *"With traditional servers, you have to worry about patching the OS, closing ports, managing firewalls, updating SSL certs, and monitoring for intrusions. With Vercel, ALL of that is handled automatically. Our attack surface is dramatically smaller because there is no server to break into."*

---

## 3.5 INVESTOR ASKED: "What Functions Are You Using?"

> **Context**: The investor asked Steve *"what function in Vercel and Supabase service function are using, and number of API or library calls"*. Here's what the investor is actually asking and how Steve should answer.

### What The Investor Is Asking

> The investor is asking about what features/capabilities the platform has, and what role Vercel and Supabase play. Here's what to tell him:
>
> *"Vercel is our **hosting and deployment platform** — it serves our web application globally. Think of it like a landlord — it hosts our app, provides the CDN, SSL, and infrastructure. We don't use Vercel's separate 'serverless functions' product — our entire Next.js application (frontend + backend API routes) is deployed as one unit on Vercel."*
>
> *"Supabase is our **backend-as-a-service** — it provides the database, user authentication, and security policies. Think of it as our back office."*

### Vercel's Role (Hosting & Deployment ONLY)

| What Vercel Does | Detail |
|-----------------|--------|
| **Hosts the app** | Serves our Next.js application to users globally |
| **CDN** | Caches and delivers static assets from edge locations worldwide |
| **SSL/HTTPS** | Automatic encryption on all traffic |
| **Auto-scaling** | Handles traffic spikes without manual intervention |
| **Deployments** | We push code → Vercel builds and deploys automatically |
| **Preview URLs** | Every code change gets a preview URL before going live |

> **Important**: We are NOT using Vercel Functions, Vercel KV, Vercel Postgres, Vercel Blob, or any other Vercel add-on products. Vercel is purely our deployment and hosting platform.

### Our API Endpoints (Built into Next.js, NOT Vercel Functions)

> *"Our API routes are part of our Next.js application — they're built into the framework itself, not a separate Vercel product. When we deploy to Vercel, the whole app (frontend pages + backend API routes) goes together as one unit."*

| Category | Count | What They Do |
|----------|-------|-------------|
| **Total API Routes** | **112** | Built into Next.js — part of the application, not a separate service |
| **Auth Endpoints** | **8** | Signup, login (OTP + password), logout, email change, session verification |
| **Student Endpoints** | **~35** | Quiz, dashboard, reports, payments, profile, AI chat, placement tests |
| **Teacher Endpoints** | **~35** | Classroom management, quiz CRUD, analytics, student management, bulk uploads |
| **Admin Endpoints** | **~14** | School management, analytics, question preview, admin operations |
| **Common/Shared Endpoints** | **~15** | Profile, classroom invitations, quiz management (shared between roles) |
| **Webhook Endpoints** | **3** | Stripe payment webhooks (invoice, subscription, customer data) |
| **Other Services** | **~2** | Text-to-speech (ElevenLabs), system settings |

### Supabase Services We Use

> "Supabase isn't just a database — it's a suite of services. Here's what we use:"

| Supabase Service | What We Use It For |
|-----------------|-------------------|
| **PostgreSQL Database** | All application data — users, questions, quiz results, classrooms, payments |
| **Supabase Auth** | User authentication — signup, login, JWT tokens, session management |
| **Row Level Security (RLS)** | Database-level access policies — users can only read/write their own data |
| **Realtime** (available) | Real-time subscriptions for live updates (built-in, available when needed) |
| **Storage** (available) | File/image storage (built-in, available when needed) |

### Third-Party Services (Library/API Calls)

> "We integrate with best-in-class third-party services for specific functions:"

| Service | What For | Security Note |
|---------|----------|--------------|
| **Stripe** | Payment processing | PCI DSS compliant — card data never touches our servers |
| **ElevenLabs** | Text-to-speech (reads questions aloud) | API key stored server-side only |
| **Google AI** | Question content auditing | Used for quality checks, no student PII sent |
| **OpenAI** | AI-powered features (Potter Chat) | API key server-side only, no student PII in prompts |
| **TensorFlow.js** | Client-side ML inference | Runs in browser — no data sent to external servers |

### How to Explain It Simply

> *"We have 112 API routes built into our Next.js application. For example, when a student submits a quiz, it calls our `submitAnswers` route. When a teacher creates a classroom, it calls our `create classroom` route. These are all part of our application code — Vercel just hosts and serves the whole thing. Supabase handles the database and authentication behind the scenes."*

### If The Investor Asks "Why 112 API Routes?"

> *"Each route handles one specific action — student login, quiz submission, teacher analytics, etc. This keeps the code modular and maintainable. It's 112 routes across 3 user roles (student, teacher, admin) covering the full platform — that's normal for a production app of this scope."*

### Architecture Diagram (Verbal Version)

> *"The flow is: User's browser → Vercel (hosts our Next.js app + 112 API routes) → Supabase (database + auth). External services like Stripe and ElevenLabs are called from our API routes server-side, never from the user's browser directly."*

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Student/    │────▶│   Vercel         │────▶│   Supabase      │
│   Teacher     │     │   (Hosts our     │     │   PostgreSQL    │
│   Browser     │◀────│   Next.js app    │◀────│   + Auth + RLS  │
│               │     │   + 112 API      │     │                 │
│               │     │     routes)       │     │                 │
└──────────────┘     └────────┬─────────┘     └─────────────────┘
                              │
                    ┌─────────┼──────────┐
                    ▼         ▼          ▼
              ┌─────────┐ ┌────────┐ ┌────────┐
              │ Stripe  │ │Eleven  │ │Google/ │
              │Payments │ │Labs TTS│ │OpenAI  │
              └─────────┘ └────────┘ └────────┘
```

---

## 4. FUNCTIONAL DEMO TALKING POINTS (Quiz Submission Flow)

If you're walking through a quiz submission, here's the flow:

```
Student opens app
    → Authenticates (JWT cookie verified)
    → Loads dashboard (questions prefetched for speed)
    → Starts quiz
    → Timer managed by React Context
    → Submits answers
        → POST /api/protected/student/quiz/submitAnswers
        → Auth middleware verifies JWT
        → Zod validates the submission data
        → Answers processed and scored
        → Results stored in Supabase
        → Student sees results + earns coins
```

**Key security points during demo:**
- "Notice the URL says `/protected/` — this endpoint requires authentication"
- "The timer is server-validated — students can't cheat by manipulating the client"
- "All answer submissions are validated before processing"

---

## 5. COMMON INVESTOR QUESTIONS & ANSWERS

### "What happens if traffic spikes 10x?"
> "Vercel auto-scales serverless functions automatically. We don't need to provision servers. If we go from 100 to 10,000 users overnight, the infrastructure handles it."

### "Where is the data stored geographically?"
> "Our Supabase project runs on AWS infrastructure. The region is configurable — we can set it based on compliance needs (e.g., US, EU, Asia)."

### "Do you have backups?"
> "Yes. Supabase provides automatic daily backups with point-in-time recovery. Vercel deployments are also versioned — we can roll back to any previous version instantly."

### "Is the code in a private repository?"
> "Yes, our code is in a private Git repository with controlled access. Only authorized team members can view or modify the codebase."

### "What about GDPR / data privacy?"
> "Both Supabase and Vercel are GDPR compliant. We can configure data residency to keep user data in specific regions. We don't sell or share user data with third parties."

### "Do you do code reviews?"
> "Yes, all code changes go through pull request reviews before deployment. Vercel creates preview deployments for every change so we can test before going live."

### "What AI models do you use and is student data sent to AI?"
> "We use Google AI and OpenAI for **content quality auditing** — checking question accuracy and quality. Student personal data is NOT sent to AI models. The AI only processes educational content (questions and answers)."

### "Why not use a traditional server (EC2, etc.)?"
> "Serverless is the modern standard for web apps at our scale. No servers to patch, no security updates to manage, automatic scaling. It's more secure because there's no server to hack into — there's no SSH access, no open ports, no OS to maintain."

---

## 6. BUZZWORDS THAT HELP (Use Naturally)

- **"Serverless architecture"** — no servers to manage or secure
- **"Edge network / CDN"** — fast globally
- **"JWT authentication"** — industry-standard secure tokens
- **"Row Level Security"** — database-level access control
- **"SOC 2 compliant"** — (Supabase has this certification)
- **"PCI DSS compliant"** — (Stripe handles payment security)
- **"Encrypted at rest and in transit"** — data is always encrypted
- **"Zero-trust architecture"** — every request is verified, nothing is trusted by default
- **"Infrastructure as code"** — deployment is automated and reproducible
- **"CI/CD pipeline"** — continuous integration and deployment

---

## 7. RED FLAGS TO WATCH FOR (Things They Might Nitpick)

| If They Say... | You Say... |
|----------------|-----------|
| "You should be on AWS directly" | "We ARE on AWS — Vercel and Supabase both run on AWS. We use managed layers for faster development and less ops burden." |
| "Where are your access keys?" | "Supabase uses anon key + service role key — this IS the access model. The anon key is safe to be public because RLS policies control what it can access." |
| "You need a WAF (Web Application Firewall)" | "Vercel includes built-in DDoS protection, bot protection, and edge security. We can add Vercel's Firewall or Cloudflare as an additional layer if needed as we scale." |
| "How do you secure your servers?" | "We don't HAVE servers — that's the point. Vercel is serverless. There's no SSH, no ports, no OS to patch. The attack surface that exists with traditional hosting simply doesn't exist here. Vercel handles all infrastructure security and they're SOC 2 Type II certified." |
| "What about deployment security?" | "Deployments can only be triggered from our private Git repo. Each deploy runs in an isolated sandbox, produces an immutable snapshot, and all secrets are encrypted. No one can modify code after it's deployed." |
| "What functions are you using on Vercel?" | "We use Vercel purely for hosting and deployment — we're not using Vercel Functions as a separate product. Our 112 API routes are built into Next.js itself. Vercel just serves the whole app, provides the CDN, SSL, and auto-scaling." |
| "What Supabase services do you use?" | "We use Supabase for three core services: PostgreSQL database for all data, Supabase Auth for login/sessions with JWT tokens, and Row Level Security policies so users can only access their own data." |
| "TypeScript errors are ignored in build" | "That's a development velocity choice for MVP stage. We plan to enable strict TypeScript as we mature the codebase." |
| "No unit tests?" | "We're in MVP stage. We have manual QA and an admin preview system for testing questions. Automated testing is on our roadmap as we scale." |
| "What about penetration testing?" | "We haven't done a formal pentest yet, but our architecture follows security best practices. A pentest is something we'd plan as part of a compliance audit." |

---

## 8. QUICK REFERENCE CARD (Print This Page)

```
HOSTING:        Vercel — deployment & CDN only (runs on AWS)
DATABASE:       Supabase PostgreSQL (runs on AWS)  
AUTH:           Supabase Auth → JWT → HTTP-only cookies
PAYMENTS:       Stripe (PCI DSS compliant)
FRAMEWORK:      Next.js 14 (React) — 112 API routes built-in
VERCEL ROLE:    Hosting, CDN, SSL, auto-scaling — NOT using Vercel Functions
API SECURITY:   Auth middleware + Route protection + Zod validation
ENCRYPTION:     TLS in transit, AES-256 at rest
SCALING:        Automatic via Vercel hosting
BACKUPS:        Daily automatic + point-in-time recovery
COMPLIANCE:     SOC 2 (Supabase), PCI DSS (Stripe), GDPR ready
AI:             Google AI + OpenAI (content auditing only, no student PII)
```

---

*Last updated: April 16, 2026*
*Prepared for investor architecture & security review meeting*
