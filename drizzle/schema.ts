import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  bio: text("bio"),
  avatarUrl: text("avatarUrl"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Hoaxes (Deconstruct Lab) ─────────────────────────────────────────────────
export const hoaxes = mysqlTable("hoaxes", {
  id: int("id").autoincrement().primaryKey(),
  slug: varchar("slug", { length: 256 }).notNull().unique(),
  title: varchar("title", { length: 512 }).notNull(),
  summary: text("summary").notNull(),
  fullBreakdown: text("fullBreakdown"),
  verdict: mysqlEnum("verdict", ["false", "misleading", "missing_context", "satire", "true"]).notNull(),
  category: varchar("category", { length: 128 }),
  tags: text("tags"),                          // JSON array string
  sourceUrl: text("sourceUrl"),
  imageUrl: text("imageUrl"),
  authorId: int("authorId"),
  status: mysqlEnum("status", ["draft", "published", "archived"]).default("draft").notNull(),
  viewCount: int("viewCount").default(0).notNull(),
  publishedAt: timestamp("publishedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Hoax = typeof hoaxes.$inferSelect;
export type InsertHoax = typeof hoaxes.$inferInsert;

// ─── Submissions (user-submitted hoax tips) ───────────────────────────────────
export const submissions = mysqlTable("submissions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  title: varchar("title", { length: 512 }).notNull(),
  description: text("description").notNull(),
  sourceUrl: text("sourceUrl"),
  category: varchar("category", { length: 128 }),
  status: mysqlEnum("status", ["pending", "reviewing", "accepted", "rejected"]).default("pending").notNull(),
  reviewNote: text("reviewNote"),
  reviewedBy: int("reviewedBy"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Submission = typeof submissions.$inferSelect;
export type InsertSubmission = typeof submissions.$inferInsert;

// ─── Verifications (user verification history) ────────────────────────────────
export const verifications = mysqlTable("verifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  inputText: text("inputText"),
  inputUrl: text("inputUrl"),
  toolUsed: varchar("toolUsed", { length: 64 }).notNull(),
  result: text("result").notNull(),            // JSON string
  verdict: varchar("verdict", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Verification = typeof verifications.$inferSelect;
export type InsertVerification = typeof verifications.$inferInsert;

// ─── Testimonials (Sober Up) ──────────────────────────────────────────────────
export const testimonials = mysqlTable("testimonials", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  displayName: varchar("displayName", { length: 256 }),
  story: text("story").notNull(),
  hoaxType: varchar("hoaxType", { length: 128 }),
  duration: varchar("duration", { length: 128 }),
  approved: boolean("approved").default(false).notNull(),
  featured: boolean("featured").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Testimonial = typeof testimonials.$inferSelect;
export type InsertTestimonial = typeof testimonials.$inferInsert;

// ─── Resources (Train Up) ─────────────────────────────────────────────────────
export const resources = mysqlTable("resources", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 512 }).notNull(),
  slug: varchar("slug", { length: 256 }).notNull().unique(),
  description: text("description").notNull(),
  content: text("content").notNull(),
  category: mysqlEnum("category", ["manipulation", "fallacies", "verification", "deepfakes", "social_media", "general"]).notNull(),
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).default("beginner").notNull(),
  isPremium: boolean("isPremium").default(false).notNull(),
  imageUrl: text("imageUrl"),
  externalUrl: text("externalUrl"),
  authorId: int("authorId"),
  viewCount: int("viewCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Resource = typeof resources.$inferSelect;
export type InsertResource = typeof resources.$inferInsert;

// ─── Memberships ──────────────────────────────────────────────────────────────
export const memberships = mysqlTable("memberships", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  tier: mysqlEnum("tier", ["free", "premium"]).default("free").notNull(),
  status: mysqlEnum("status", ["active", "cancelled", "expired"]).default("active").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 256 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 256 }),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelledAt: timestamp("cancelledAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Membership = typeof memberships.$inferSelect;
export type InsertMembership = typeof memberships.$inferInsert;

// ─── Partners ─────────────────────────────────────────────────────────────────
export const partners = mysqlTable("partners", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  orgName: varchar("orgName", { length: 512 }).notNull(),
  orgType: mysqlEnum("orgType", ["fact_checker", "journalist", "ngo", "academic", "media_org"]).notNull(),
  website: text("website"),
  description: text("description"),
  badgeLevel: mysqlEnum("badgeLevel", ["bronze", "silver", "gold", "platinum"]).default("bronze").notNull(),
  verified: boolean("verified").default(false).notNull(),
  revenueSharePct: int("revenueSharePct").default(0).notNull(),
  applicationNote: text("applicationNote"),
  approvedBy: int("approvedBy"),
  approvedAt: timestamp("approvedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type Partner = typeof partners.$inferSelect;
export type InsertPartner = typeof partners.$inferInsert;

// ─── Email Forwardings (user-submitted emails for verification) ───────────────
export const emailForwardings = mysqlTable("emailForwardings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  senderEmail: varchar("senderEmail", { length: 320 }).notNull(),
  senderName: varchar("senderName", { length: 256 }),
  companyName: varchar("companyName", { length: 256 }),
  subject: varchar("subject", { length: 512 }),
  emailBody: text("emailBody").notNull(),
  suspiciousHooks: text("suspiciousHooks"),                    // JSON array of identified red flags
  verdict: varchar("verdict", { length: 64 }),                 // "phishing", "scam", "spam", "safe", "pending"
  analysis: text("analysis"),                                   // AI analysis result as JSON
  status: mysqlEnum("status", ["pending", "analyzing", "completed", "archived"]).default("pending").notNull(),
  submittedAt: timestamp("submittedAt").defaultNow().notNull(),
  analyzedAt: timestamp("analyzedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type EmailForwarding = typeof emailForwardings.$inferSelect;
export type InsertEmailForwarding = typeof emailForwardings.$inferInsert;

// ─── Credibility Searches (fact-check queries) ─────────────────────────────────────
export const credibilitySearches = mysqlTable("credibilitySearches", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  query: varchar("query", { length: 512 }).notNull(),
  verdict: varchar("verdict", { length: 64 }),                 // "true", "false", "misleading", "unverified"
  credibilityScore: int("credibilityScore"),                    // 0-100 score
  summary: text("summary"),                                     // Brief fact-check result
  sources: text("sources"),                                     // JSON array of source URLs
  fullAnalysis: text("fullAnalysis"),                           // Detailed analysis
  status: mysqlEnum("status", ["pending", "completed", "archived"]).default("pending").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
export type CredibilitySearch = typeof credibilitySearches.$inferSelect;
export type InsertCredibilitySearch = typeof credibilitySearches.$inferInsert;

// ─── Donations ────────────────────────────────────────────────────────────────
export const donations = mysqlTable("donations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  amount: int("amount").notNull(),
  currency: varchar("currency", { length: 8 }).default("usd").notNull(),
  type: mysqlEnum("type", ["one_time", "recurring"]).default("one_time").notNull(),
  status: mysqlEnum("status", ["pending", "completed", "failed", "refunded"]).default("pending").notNull(),
  stripePaymentIntentId: varchar("stripePaymentIntentId", { length: 256 }),
  message: text("message"),
  anonymous: boolean("anonymous").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});
export type Donation = typeof donations.$inferSelect;
export type InsertDonation = typeof donations.$inferInsert;
