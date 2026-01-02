import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, buroConsultations, BuroConsultation, InsertBuroConsultation } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Helpers para consultas de Buró

export async function createBuroConsultation(data: InsertBuroConsultation): Promise<BuroConsultation> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(buroConsultations).values(data);
  const consultationId = result[0].insertId;
  
  const consultation = await db
    .select()
    .from(buroConsultations)
    .where(eq(buroConsultations.id, Number(consultationId)))
    .limit(1);

  if (!consultation.length) {
    throw new Error("Failed to create consultation");
  }

  return consultation[0];
}

export async function updateBuroConsultation(
  id: number,
  data: Partial<InsertBuroConsultation>
): Promise<BuroConsultation> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(buroConsultations).set(data).where(eq(buroConsultations.id, id));

  const result = await db
    .select()
    .from(buroConsultations)
    .where(eq(buroConsultations.id, id))
    .limit(1);

  if (!result.length) {
    throw new Error("Consultation not found");
  }

  return result[0];
}

export async function getBuroConsultation(id: number): Promise<BuroConsultation | undefined> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select()
    .from(buroConsultations)
    .where(eq(buroConsultations.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserBuroConsultations(userId: number): Promise<BuroConsultation[]> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  return db
    .select()
    .from(buroConsultations)
    .where(eq(buroConsultations.userId, userId));
}
