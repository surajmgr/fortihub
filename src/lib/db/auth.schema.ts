import { relations } from "drizzle-orm";
import {
  pgTable,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  index,
} from "drizzle-orm/pg-core";

// -------------------- USERS --------------------
export const users = pgTable(
  "users",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),
    image: text("image"),
    createdAt: timestamp("created_at", { withTimezone: false })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: false })
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    username: text("username").unique(),
    displayUsername: text("display_username"),
    isAnonymous: boolean("is_anonymous"),
    twoFactorEnabled: boolean("two_factor_enabled").default(false),
    role: text("role"),
    banned: boolean("banned").default(false),
    banReason: text("ban_reason"),
    banExpires: timestamp("ban_expires", { withTimezone: false }),
  },
  table => [
    index("users_created_at_idx").on(table.createdAt),
    index("users_updated_at_idx").on(table.updatedAt),
    index("users_email_idx").on(table.email),
    index("users_username_idx").on(table.username),
    index("users_ban_expires_idx").on(table.banExpires),
  ]
);

// -------------------- SESSIONS --------------------
export const sessions = pgTable(
  "sessions",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    expiresAt: timestamp("expires_at").notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => /* @__PURE__ */ new Date()).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    timezone: text("timezone"),
    city: text("city"),
    country: text("country"),
    region: text("region"),
    regionCode: text("region_code"),
    colo: text("colo"),
    latitude: text("latitude"),
    longitude: text("longitude"),
    impersonatedBy: text("impersonated_by"),
  },
  table => [
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_expires_at_idx").on(table.expiresAt),
    index("sessions_token_idx").on(table.token),
    index("sessions_geo_idx").on(table.country, table.region),
    index("sessions_impersonated_by_idx").on(table.impersonatedBy),
  ]
);

// -------------------- ACCOUNTS --------------------
export const accounts = pgTable(
  "accounts",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at"),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => /* @__PURE__ */ new Date()).notNull(),
  },
  table => [
    index("accounts_provider_account_idx").on(
      table.providerId,
      table.accountId
    ),
    index("accounts_user_id_idx").on(table.userId),
    index("accounts_created_at_idx").on(table.createdAt),
    index("accounts_access_token_expires_at_idx").on(
      table.accessTokenExpiresAt
    ),
  ]
);

// -------------------- VERIFICATIONS --------------------
export const verifications = pgTable(
  "verifications",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => /* @__PURE__ */ new Date()).notNull(),
  },
  table => [
    index("verifications_identifier_idx").on(table.identifier),
    index("verifications_expires_at_idx").on(table.expiresAt),
    index("verifications_value_idx").on(table.value),
  ]
);

// -------------------- PASSKEYS --------------------
export const passkey = pgTable(
  "passkey",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    name: text("name"),
    publicKey: text("public_key").notNull(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    credentialID: text("credential_id").notNull(),
    counter: integer("counter").notNull(),
    deviceType: text("device_type").notNull(),
    backedUp: boolean("backed_up").notNull(),
    transports: text("transports"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    aaguid: text("aaguid"),
  },
  table => [
    index("passkeys_user_id_idx").on(table.userId),
    index("passkeys_credential_id_idx").on(table.credentialID),
    index("passkeys_device_type_idx").on(table.deviceType),
  ]
);

// -------------------- TWO FACTORS --------------------
export const twoFactor = pgTable(
  "two_factor",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    secret: text("secret").notNull(),
    backupCodes: text("backup_codes").notNull(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  table => [
    index("two_factors_user_id_idx").on(table.userId)
  ]
);

// -------------------- USER CONSENTS --------------------
export const userConsents = pgTable(
  "user_consents",
  {
    id: varchar("id", { length: 255 }).primaryKey(),
    userId: varchar("user_id", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    key: text("key").notNull(), // e.g., "email_visibility", "show_location", "marketing_opt_in"
    value: text("value").notNull(), // e.g., "public", "friends", "private", "true", "false"
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().$onUpdate(() => /* @__PURE__ */ new Date()).notNull(),
  },
  table => [
    index("user_consents_user_idx").on(table.userId),
    index("user_consents_key_idx").on(table.key),
  ]
);

export const userRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  passkeys: many(passkey),
  twoFactors: many(twoFactor),
  userConsents: many(userConsents),
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const passkeyRelations = relations(passkey, ({ one }) => ({
  user: one(users, {
    fields: [passkey.userId],
    references: [users.id],
  }),
}));

export const twoFactorRelations = relations(twoFactor, ({ one }) => ({
  user: one(users, {
    fields: [twoFactor.userId],
    references: [users.id],
  }),
}));

export const userConsentRelations = relations(userConsents, ({ one }) => ({
  user: one(users, {
    fields: [userConsents.userId],
    references: [users.id],
  }),
}));
