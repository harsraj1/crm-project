# CRM Fast-Track: 10-Phase Delivery Roadmap

This roadmap compresses the original 60-day plan into ten outcome-based phases. A phase is complete only when its acceptance checks pass; phases are not fixed to a particular number of days.

## Current baseline (repository audit, 2026-09-01)

| Area | Current state | Main gap |
|---|---|---|
| React application | Login/register, dashboard, leads, lead detail, customers, settings | Several edit/delete/settings controls are placeholders; no customer detail route |
| API | Auth, lead, customer, and activity models/controllers/routes | Needs automated tests, consistent authorization, and complete user/notification APIs |
| Data | MongoDB models and indexes | No migrations/seed workflow or backup/restore runbook |
| Events | Kafka client, producer, consumer, topics | Consumer is not started by the API; no retry/DLQ, idempotency, or observable delivery guarantees |
| AI | OpenAI/Hugging Face summary service | Async result delivery and UI feedback are incomplete; secrets/cost controls need hardening |
| Operations | Development Compose and Dockerfiles | Production targets were missing; CI, monitoring, backups, and hosted deployment remain |
| Quality | Lint/test scripts are declared | No test files or CI quality gate are present |

## Phase 1 — Stabilize the runnable baseline

**Goal:** one documented command starts a working application.

- Fix module paths, request validation, route wiring, and frontend/backend contract mismatches.
- Add environment templates with safe defaults and startup validation for required production secrets.
- Add seed data for an admin, sales user, leads, customers, and activities.
- Keep Kafka optional for a simple first deployment while retaining the event-driven path.

**Exit:** fresh clone can install, start, register/login, and complete lead/customer CRUD without runtime errors.

## Phase 2 — Finish the CRM core

**Goal:** complete the daily sales workflow before adding more infrastructure.

- Finish lead and customer create/view/edit/delete flows.
- Add customer 360 view and activity timeline.
- Add assignment, follow-up dates, tags, filters, pagination, and search.
- Convert a won lead into a customer without duplicate records.

**Exit:** a sales user can take a lead from creation to won/lost and preserve its history.

## Phase 3 — Roles, teams, and data ownership

**Goal:** make multi-user usage safe.

- Lock public registration to the `sales` role; admin/manager roles must be granted by an authorized user.
- Add team/user administration, deactivation, reassignment, and ownership checks to every record endpoint.
- Add audit fields and an immutable audit log for important changes.

**Exit:** admin, manager, and sales permissions pass integration tests with no cross-user data leakage.

## Phase 4 — Pipeline and dashboard

**Goal:** turn stored records into an effective sales workspace.

- Add a drag-and-drop pipeline board with optimistic updates and rollback.
- Complete KPI calculations: pipeline value, conversion rate, win rate, aging, and overdue follow-ups.
- Add saved filters and manager/team views.

**Exit:** dashboard values reconcile with database fixtures and pipeline movement works on desktop/mobile.

## Phase 5 — Reliable Kafka workflows

**Goal:** use Kafka for workflows that benefit from decoupling, not for basic CRUD availability.

- Start consumers as a separate worker process/container.
- Version event envelopes and add correlation ID, producer, timestamp, and schema version.
- Add retry topics, dead-letter handling, idempotent consumers, and health/lag metrics.
- Publish notifications, audit events, activity events, and AI jobs through an outbox pattern.

**Exit:** duplicate delivery is safe, failed events are inspectable/replayable, and API writes survive Kafka downtime.

## Phase 6 — Notifications and useful integrations

**Goal:** close the follow-up loop.

- Implement notification API/UI with unread counts and SSE or WebSocket live updates.
- Add email sending for assignments, reminders, and daily digest.
- Add CSV import/export; defer calendar/mailbox sync until the core is stable.

**Exit:** assignment and due-follow-up events reach the intended user in-app and by configured email.

## Phase 7 — Focused AI assistance

**Goal:** ship two explainable, measurable AI features.

- Add deterministic lead scoring first, including a visible score breakdown.
- Complete AI lead summaries and one email-draft workflow with human approval.
- Add prompt-injection boundaries, redaction, timeouts, quotas, usage logging, and provider fallback behavior.
- Do not add RAG or forecasting until there is enough real, permission-safe data.

**Exit:** AI features fail safely, expose their basis, stay within a configured budget, and never send content automatically.

## Phase 8 — Testing and security gate

**Goal:** make releases repeatable.

- Unit-test scoring, validation, auth, and event serialization.
- Integration-test auth and core CRUD with role/ownership cases.
- Add Playwright smoke tests for login, lead lifecycle, and customer conversion.
- Add dependency scanning, secret scanning, secure headers, rate limits, payload limits, and an OWASP-style review.

**Exit:** CI blocks merges on failed lint/build/tests or high-severity security findings; critical flows pass end to end.

## Phase 9 — Production deployment and observability

**Goal:** run safely on one production environment.

- Use immutable production images, a managed database, TLS, secret injection, and least-privilege networking.
- Add readiness/liveness checks, structured logs, request/correlation IDs, error tracking, and basic metrics/alerts.
- Document database backup/restore and event recovery; test rollback.
- Start with one API and one worker replica; add Kubernetes only after scale justifies it.

**Exit:** staging deploy, smoke test, rollback, backup, and restore are documented and successfully rehearsed.

## Phase 10 — Launch, polish, and operate

**Goal:** ship a credible full CRM and create a sustainable backlog.

- Perform accessibility, responsive UI, empty/loading/error-state, and performance passes.
- Add onboarding, demo seed/reset, API documentation, architecture diagram, and operator runbook.
- Run a small pilot, fix launch blockers, define SLOs, and measure activation, follow-up completion, and conversion.
- Move nonessential ideas—Kubernetes, schema registry, RAG, predictive forecasting, chaos engineering—to a post-launch backlog.

**Exit:** public deployment is usable by pilot users, monitored, recoverable, and understandable by a new contributor.

## Recommended execution order

For the fastest credible release, complete phases 1–4, then 8–10. Add phases 5–7 incrementally after the core workflow is stable. This keeps Kafka and AI as real product capabilities without letting them block the first deployable CRM.
