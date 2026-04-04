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


## Credibility Search Feature
- [x] Add credibilitySearches table to Drizzle schema
- [x] Create database migration for credibilitySearches table
- [x] Add credibility search router to server/routers.ts
- [x] Create CredibilitySearch page component with search form
- [x] Add credibility search link to Navbar
- [x] Add credibility search link to homepage
- [x] Write vitest tests for credibility search router
- [x] Test search flow end-to-end


## Sender Email Tracking & Scam Alerts
- [x] Add scamSenderEmails table to Drizzle schema
- [x] Create database migration for scamSenderEmails table
- [x] Add sender email tracking router to server/routers.ts
- [x] Update EmailScanner to show warning if sender is flagged
- [x] Add "Report Sender" button to EmailScanner results
- [x] Create admin dashboard to view/manage flagged senders
- [x] Write vitest tests for sender tracking router
- [x] Test scam alert flow end-to-end


## Stripe Payment Integration
- [x] Add Stripe feature to project scaffold
- [x] Configure Stripe API keys (publishable and secret)
- [x] Create Premium membership checkout page
- [x] Create donation checkout page
- [x] Add Stripe webhook handler for payment confirmations
- [x] Update membership table to track Stripe payment IDs
- [x] Update donation table to track Stripe payment IDs
- [x] Create payment success/cancel pages
- [x] Write vitest tests for payment routers
- [x] Test end-to-end payment flow


## Admin Dashboard
- [x] Add admin query helpers to server/db.ts
- [x] Create admin review routers in server/routers.ts
- [x] Create AdminDashboard page component
- [x] Build email review panel with verdict form
- [x] Build credibility search review panel
- [x] Build hoax submission review panel
- [x] Build flagged sender management panel
- [x] Add admin-only route protection
- [x] Add admin link to navigation
- [x] Write vitest tests for admin routers
- [x] Test admin dashboard end-to-end

## Deconstruct Lab Seeded Content
- [x] Create seed script with 8 real-world hoax examples
- [x] Populate database with phishing scams (Amazon, IRS, PayPal, Microsoft, Bank of America, LinkedIn)
- [x] Populate database with deepfakes (Tom Hanks crypto, Elon Musk stock giveaway)
- [x] Verify Deconstruct Lab displays all seeded content
- [x] Test hoax detail pages render correctly
- [x] Verify all 64 tests passing

## Typography Standardization
- [x] Audit current font usage across all pages
- [x] Update global CSS with standardized font stack (Space Grotesk for body, Bebas Neue removed from h1-h6)
- [x] Add font weight definitions for all heading levels (h1-h6)
- [x] Add letter-spacing and line-height standards for readability
- [x] Enable font smoothing for better definition (-webkit-font-smoothing, -moz-osx-font-smoothing)
- [x] Verify typography consistency across homepage, toolkit, and other pages
- [x] Test all 64 tests still passing after CSS changes
