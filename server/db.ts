import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  donations,
  hoaxes,
  InsertUser,
  memberships,
  partners,
  resources,
  submissions,
  testimonials,
  users,
  verifications,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    const value = user[field];
    if (value === undefined) continue;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0] ?? null;
}

export async function updateUserProfile(userId: number, data: { name?: string; bio?: string; avatarUrl?: string }) {
  const db = await getDb();
  if (!db) return;
  await db.update(users).set(data).where(eq(users.id, userId));
}

// ─── Hoaxes ───────────────────────────────────────────────────────────────────
export async function getPublishedHoaxes(limit = 20, offset = 0, category?: string) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [eq(hoaxes.status, "published")];
  if (category) conditions.push(eq(hoaxes.category, category));
  return db
    .select()
    .from(hoaxes)
    .where(and(...conditions))
    .orderBy(desc(hoaxes.publishedAt))
    .limit(limit)
    .offset(offset);
}

export async function getHoaxBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(hoaxes).where(eq(hoaxes.slug, slug)).limit(1);
  if (result[0]) {
    await db.update(hoaxes).set({ viewCount: sql`${hoaxes.viewCount} + 1` }).where(eq(hoaxes.id, result[0].id));
  }
  return result[0] ?? null;
}

export async function getFeaturedHoaxes(limit = 3) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(hoaxes)
    .where(eq(hoaxes.status, "published"))
    .orderBy(desc(hoaxes.viewCount))
    .limit(limit);
}

// ─── Submissions ──────────────────────────────────────────────────────────────
export async function createSubmission(data: {
  userId?: number | null;
  title: string;
  description: string;
  sourceUrl?: string;
  category?: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(submissions).values({ ...data, status: "pending" });
}

export async function getUserSubmissions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(submissions).where(eq(submissions.userId, userId)).orderBy(desc(submissions.createdAt));
}

// ─── Verifications ────────────────────────────────────────────────────────────
export async function saveVerification(data: {
  userId?: number | null;
  inputText?: string;
  inputUrl?: string;
  toolUsed: string;
  result: object;
  verdict?: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(verifications).values({
    ...data,
    result: JSON.stringify(data.result),
  });
}

export async function getUserVerifications(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(verifications)
    .where(eq(verifications.userId, userId))
    .orderBy(desc(verifications.createdAt))
    .limit(limit);
}

// ─── Testimonials ─────────────────────────────────────────────────────────────
export async function getApprovedTestimonials(limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(testimonials)
    .where(eq(testimonials.approved, true))
    .orderBy(desc(testimonials.createdAt))
    .limit(limit);
}

export async function getFeaturedTestimonials(limit = 3) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(testimonials)
    .where(and(eq(testimonials.approved, true), eq(testimonials.featured, true)))
    .orderBy(desc(testimonials.createdAt))
    .limit(limit);
}

export async function createTestimonial(data: {
  userId?: number | null;
  displayName?: string;
  story: string;
  hoaxType?: string;
  duration?: string;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(testimonials).values({ ...data, approved: false, featured: false });
}

// ─── Resources ────────────────────────────────────────────────────────────────
export async function getResources(category?: string, isPremium?: boolean, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  const conditions = [];
  if (category) conditions.push(eq(resources.category, category as any));
  if (isPremium !== undefined) conditions.push(eq(resources.isPremium, isPremium));
  const query = db
    .select()
    .from(resources)
    .orderBy(desc(resources.createdAt))
    .limit(limit);
  if (conditions.length > 0) return query.where(and(...conditions));
  return query;
}

export async function getResourceBySlug(slug: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(resources).where(eq(resources.slug, slug)).limit(1);
  if (result[0]) {
    await db.update(resources).set({ viewCount: sql`${resources.viewCount} + 1` }).where(eq(resources.id, result[0].id));
  }
  return result[0] ?? null;
}

// ─── Memberships ──────────────────────────────────────────────────────────────
export async function getMembershipByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(memberships).where(eq(memberships.userId, userId)).limit(1);
  return result[0] ?? null;
}

export async function upsertMembership(data: {
  userId: number;
  tier: "free" | "premium";
  status: "active" | "cancelled" | "expired";
  currentPeriodEnd?: Date;
}) {
  const db = await getDb();
  if (!db) return;
  const existing = await getMembershipByUserId(data.userId);
  if (existing) {
    await db.update(memberships).set(data).where(eq(memberships.userId, data.userId));
  } else {
    await db.insert(memberships).values(data);
  }
}

// ─── Partners ─────────────────────────────────────────────────────────────────
export async function getVerifiedPartners() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(partners).where(eq(partners.verified, true)).orderBy(desc(partners.approvedAt));
}

export async function getPartnerByUserId(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(partners).where(eq(partners.userId, userId)).limit(1);
  return result[0] ?? null;
}

export async function createPartnerApplication(data: {
  userId: number;
  orgName: string;
  orgType: "fact_checker" | "journalist" | "ngo" | "academic" | "media_org";
  website?: string;
  description: string;
  applicationNote: string;
  verified: boolean;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(partners).values(data);
}

// ─── Donations ────────────────────────────────────────────────────────────────
export async function createDonation(data: {
  userId?: number | null;
  amount: number;
  currency: string;
  type: "one_time" | "recurring";
  status: "pending" | "completed" | "failed" | "refunded";
  message?: string;
  anonymous: boolean;
}) {
  const db = await getDb();
  if (!db) return;
  await db.insert(donations).values(data);
}

export async function getDonationStats() {
  const db = await getDb();
  if (!db) return { total: 0, count: 0 };
  const result = await db
    .select({ total: sql<number>`SUM(amount)`, count: sql<number>`COUNT(*)` })
    .from(donations)
    .where(eq(donations.status, "completed"));
  return { total: result[0]?.total ?? 0, count: result[0]?.count ?? 0 };
}
