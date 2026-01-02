import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Tabla para historial de consultas de Buró
export const buroConsultations = mysqlTable("buro_consultations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  // Datos personales capturados
  firstName: varchar("firstName", { length: 100 }).notNull(),
  lastName: varchar("lastName", { length: 100 }).notNull(),
  rfc: varchar("rfc", { length: 13 }).notNull(),
  birthDate: varchar("birthDate", { length: 10 }).notNull(), // YYYY-MM-DD
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  state: varchar("state", { length: 100 }).notNull(),
  postalCode: varchar("postalCode", { length: 5 }).notNull(),
  // Estado de la consulta
  status: mysqlEnum("status", ["pending", "authenticated", "completed", "failed"]).default("pending").notNull(),
  // Datos de autenticación
  authenticationData: text("authenticationData"), // JSON con respuestas de autenticación
  // Datos del reporte
  reportData: text("reportData"), // JSON con datos del Buró (Informe Buró)
  incomeEstimate: text("incomeEstimate"), // JSON con estimación de ingresos
  prospectorData: text("prospectorData"), // JSON con datos del Prospector
  monitorData: text("monitorData"), // JSON con datos del Monitor (NUEVO)
  creditReportData: text("creditReportData"), // JSON con datos del Reporte de Crédito (NUEVO)
  // Errores
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BuroConsultation = typeof buroConsultations.$inferSelect;
export type InsertBuroConsultation = typeof buroConsultations.$inferInsert;
