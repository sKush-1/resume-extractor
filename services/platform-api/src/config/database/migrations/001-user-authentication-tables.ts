/* eslint-disable camelcase */
import type { MigrationBuilder } from "node-pg-migrate";

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable("users", {
    id: {
      primaryKey: true,
      type: "uuid",
      notNull: true,
      unique: true,
      default: pgm.func("uuidv7()"),
    },

    email: {
      type: "VARCHAR(150)",
      notNull: true,
      unique: true,
    },
    name: {
      type: "VARCHAR(150)",
      notNull: true,
    },
    created_at: {
      type: "TIMESTAMPTZ",
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: "TIMESTAMPTZ",
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
  });

  pgm.createIndex("users", "email", { name: "idx_users_email" });

  pgm.createTable("auth_providers", {
    id: {
      primaryKey: true,
      type: "uuid",
      notNull: true,
      unique: true,
      default: pgm.func("uuidv7()"),
    },
    user_id: {
      type: "uuid",
      notNull: true,
      references: "users",
      onDelete: "CASCADE",
    },
    provider: {
      type: "VARCHAR(50)",
      notNull: true, // "email" | "google"
    },
    provider_id: {
      type: "VARCHAR(255)", // googleId OR null for email
    },
    password_hash: {
      type: "VARCHAR(255)", // only for email provider
    },
    created_at: {
      type: "TIMESTAMPTZ",
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
  });

  pgm.createIndex("auth_providers", ["provider", "provider_id"]);
  pgm.createIndex("auth_providers", "user_id");

  // One user cannot have duplicate provider entries
  pgm.addConstraint(
    "auth_providers",
    "unique_provider_per_user",
    "UNIQUE(user_id, provider)",
  );

  // -------------------------------------
  // SESSIONS TABLE (Refresh Tokens)
  // -------------------------------------
  pgm.createTable("sessions", {
    id: {
      primaryKey: true,
      type: "uuid",
      notNull: true,
      unique: true,
      default: pgm.func("uuidv7()"),
    },
    user_id: {
      type: "uuid",
      references: "users",
      notNull: true,
      onDelete: "CASCADE",
    },
    refresh_token: {
      type: "TEXT",
      notNull: true,
      unique: true,
    },
    user_agent: {
      type: "TEXT",
    },
    ip_address: {
      type: "VARCHAR(45)",
    },
    expires_at: {
      type: "TIMESTAMPTZ",
      notNull: true,
    },
    created_at: {
      type: "TIMESTAMPTZ",
      default: pgm.func("CURRENT_TIMESTAMP"),
    },
  });

  pgm.createIndex("sessions", "user_id");

  // -------------------------------------
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable("sessions");
  pgm.dropConstraint("auth_providers", "unique_provider_per_user");
  pgm.dropTable("auth_providers");
  pgm.dropIndex("users", "email");
  pgm.dropTable("users");
}
