# Security Review - Replies to Investor Questions

> **For Steve**: Copy-paste or paraphrase these.

---

## 1. Sensitive Key Storage

Great question. As you may have noticed if you've reviewed the codebase, we use **environment variables** for all sensitive keys. For context, environment variables are secrets that live entirely outside the codebase. They're configured in our hosting platform (Vercel) and injected into the application only at runtime. They never appear in source code, never get committed to Git, and are never visible in the browser.

On Vercel's side, all environment variables are **encrypted at rest** (AES-256) and scoped per environment, so production, staging, and development keys are completely separate.

In our code, a utility called `EnvManager` handles key retrieval. It automatically selects the correct key based on the environment (production vs development) and throws an error if any required key is missing. The app won't start if a secret is absent.

To directly answer: STRIPE_TEST_SECRET and all other sensitive keys (STRIPE_PROD_SECRET, SUPABASE_SERVICE_ROLE_KEY, webhook secrets, etc.) are encrypted on Vercel, never in our codebase, and only accessible server-side at runtime.

---

## 2. Stripe API Variable Handling

As you'll see in our Stripe integration module, the Stripe client is initialized exclusively on the server side. We enforce this with a `"server-only"` import at the top of the file. This is a Next.js feature that makes it physically impossible for this code to run in the browser. If someone accidentally tried to import it on the frontend, the build would fail.

The retrieval logic:
- `EnvManager.getVariable("STRIPE_PROD_SECRET", "STRIPE_TEST_SECRET")` checks whether we're in production or development, then pulls the corresponding key from environment variables
- **Zero hard-coded values** anywhere in the Stripe integration. You can verify this by searching the codebase for raw key strings; you won't find any
- Keys are not stored in any config file, `.env` file committed to the repo, or anywhere in source code

Regarding IP restrictions: Stripe's API keys are already scoped by their own key management system (restricted vs secret keys, configurable in the Stripe Dashboard). IP allowlisting is an optional layer that can be enabled there if your compliance requirements call for it.

---

## 3. Webhook Verification & Replay Attack Prevention

If you've looked at our webhook routes, you'll have seen we use **Stripe's official `constructEvent` method**, which is Stripe's recommended approach for webhook verification.

**Signature Verification:**
1. Every incoming Stripe webhook carries a `stripe-signature` header
2. Our code passes this signature, the raw request body, and our webhook signing secret to `stripe.webhooks.constructEvent()`
3. This method computes an HMAC-SHA256 hash and compares it against the signature. If they don't match, the webhook is rejected

**Replay Attack Prevention:**
`constructEvent` also validates the **timestamp** in the signature header. It rejects any event older than 300 seconds (5 minutes). Even if an attacker intercepted a valid webhook payload, they couldn't replay it after this window.

**Per-event-type secrets:**
As you might have noticed, we don't use a single webhook secret. We have **separate signing secrets for each event type** (invoice, customer data, subscriptions). Compromising one doesn't affect the others.

---

## 4. reconcilePaymentStatus API Reliability

This endpoint verifies a student's payment status by checking directly with Stripe (the source of truth) and updating our database if there's a discrepancy.

**Database disconnection:** The entire operation is wrapped in a try/catch. If the database is unavailable, the request returns a 500 error. The database write is a **single atomic operation** (one `updatePayingStatus()` call). There's no multi-step transaction that could leave data inconsistent. It either succeeds completely or fails completely.

**What if a user paid but the DB was temporarily down?** Stripe processes payments independently on their side. Even if our database misses a webhook update due to downtime, `reconcilePaymentStatus` acts as an **automatic safety net**. It runs when the student opens the app, checks directly with Stripe whether the user has an active subscription, and corrects our database if there's a mismatch. So the user is never charged without eventually getting access. Stripe is always the source of truth.

**Duplicate authorization:** The endpoint is **idempotent**. Calling it multiple times produces the same result. It reads from Stripe, compares to our database, and reconciles if needed. Ten calls in a row = identical outcome. No risk of duplicate authorization.

The endpoint also requires JWT authentication and verifies the user role is "student" before proceeding. Unauthenticated users or wrong roles are rejected.

**Response:** Returns `{ paying: boolean, reconciled: boolean }` to the authenticated client.

---

## 5. ONNX Model File Integrity

If you've looked at our model loading code, you'll have noticed the `.onnx` files are **not stored locally**. They're hosted in a **Supabase Storage bucket** (S3-compatible object storage under the hood).

**Loading process:**
1. Server requests the model from Supabase Storage using an authenticated request (Supabase Service Role Key in the Authorization header)
2. File is downloaded as a byte array
3. Passed to ONNX Runtime's `InferenceSession.create()` which **validates the model structure** during parsing. A corrupted or malformed file would fail at this step

**Malicious code injection:** ONNX files are data files containing mathematical weights and graph operations, not executable code. ONNX Runtime interprets them as computation graphs, not programs. You can't embed executable code in an `.onnx` file the way you could in a Python pickle file. This is one of the security advantages of the ONNX format.

**Model origin:** Our own models, trained internally for adaptive question difficulty prediction, organized by education level and year.

---

## 6. Model File Storage & Access Control

As you may have seen in the model directory configuration:

**Storage:** Supabase Storage bucket called `torchModels`. Supabase Storage is built on S3-compatible infrastructure with its own access control layer.

**Access control:** The bucket is configured as `authenticated`, meaning every request must include a valid authorization token. Our server accesses it using the Supabase Service Role Key, which never leaves the server side. Unauthenticated requests are rejected. There is no public URL for these files.

**Is Supabase the right choice?** For our scale, yes. Supabase Storage provides the same security guarantees as a private S3 bucket (because it IS S3-compatible underneath): encrypted at rest, encrypted in transit, token-based access control. If compliance requirements ever demand a dedicated AWS S3 bucket with IAM roles, the migration is straightforward since the interfaces are compatible.

---

## 7. ONNX Runtime & WebAssembly Isolation

If you've reviewed the ONNX initialization code, you'll have seen the WASM setup:

**The WASM file is local, not downloaded.** `ort-wasm-simd.wasm` is bundled with our application at a fixed path in the codebase. It does NOT get downloaded from any external source at runtime.

**WebAssembly isolation:** WASM has a sandboxed memory model by design. This is a fundamental property of the WASM specification, not something we configure. In practice:
- Cannot access the host filesystem
- Cannot access system memory outside its own allocated space
- Cannot make network requests
- Cannot access environment variables or process resources

We also run ONNX Runtime in **single-threaded mode**, which eliminates any concurrency-related attack surface.

**Can execution affect local files?** No. This is architecturally impossible due to the WebAssembly sandbox. The binary is loaded from a local path (read-only), executes math operations in sandboxed memory, and returns results. Zero access to filesystem, network, or system resources.

---

*Prepared by the Pebbo engineering team*
