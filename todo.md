# Don't Drink the Digital Punch — TODO

## Database & Backend
- [x] Database schema: users, hoaxes, submissions, verifications, memberships, partners, testimonials, resources, donations
- [x] DB helpers in server/db.ts
- [x] tRPC routers: hoaxes, submissions, verifications, memberships, partners, testimonials, resources, donations
- [x] Email scanner tRPC procedure (AI-powered)
- [x] Video analyzer tRPC procedure (AI-powered)
- [x] URL analyzer tRPC procedure (AI-powered)
- [x] Text manipulation scanner tRPC procedure (AI-powered)

## Frontend Pages
- [x] Global layout: Navbar, Footer, brand CSS (glitch aesthetic, Electric Cyan, dark theme)
- [x] Homepage: hero glitch section, brand manifesto, content pillars preview, CTA
- [x] Deconstruct Lab: hoax archive feed, tagging, detailed breakdown view, submission form
- [x] Verification Toolkit: URL analyzer, text scanner, email scanner, video analyzer
- [x] Email Scam Scanner page
- [x] Video Authenticity Analyzer page
- [x] Sober Up: community testimonials feed, submission form
- [x] Train Up: educational resource library, guides, logical fallacies
- [x] Premium Membership: tier comparison, subscription CTA, exclusive content gate
- [x] Partner Badge System: partner directory, application form, badge display
- [x] Donation page: one-time and recurring contribution UI
- [x] User Profile: auth-gated, submission history, saved verifications, membership status
- [x] 404 Not Found page

## Auth & Monetization
- [x] User authentication (Manus OAuth)
- [x] Premium membership gate (protectedProcedure + role check)
- [x] Partner badge application and verification flow
- [x] Donation/payment integration (Stripe placeholder — store coming soon)

## Assets
- [x] Upload Title.svg and Title.mp4 to CDN
- [x] Use Title.mp4 animated logo on homepage hero
- [x] Wire CDN logo across site (navbar, favicon)

## Quality
- [x] Vitest tests for all tRPC routers (29 tests passing)
- [x] Responsive design (mobile-first)
- [x] Profile page status comparison fixed
- [x] Checkpoint and delivery


## Email Forwarding Feature
- [x] Add emailForwardings table to Drizzle schema
- [x] Create database migration for emailForwardings table
- [x] Add emailForwarding router to server/routers.ts
- [x] Create ForwardEmail page component
- [x] Add email forwarding link to Navbar
- [x] Add email forwarding link to EmailScanner page
- [x] Write vitest tests for email forwarding router
- [x] Test email submission flow end-to-end
