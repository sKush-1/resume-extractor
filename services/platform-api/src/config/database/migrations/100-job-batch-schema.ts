import type { MigrationBuilder } from "node-pg-migrate";

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    // ─── Batches Table ──────────────────────────────────
    pgm.createTable("batches", {
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
        name: {
            type: "VARCHAR(255)",
        },
        status: {
            type: "VARCHAR(20)",
            notNull: true,
            default: "pending",
        },
        resume_count: {
            type: "INTEGER",
            notNull: true,
            default: 0,
        },
        processed_count: {
            type: "INTEGER",
            notNull: true,
            default: 0,
        },
        failed_count: {
            type: "INTEGER",
            notNull: true,
            default: 0,
        },
        export_file_key: {
            type: "TEXT",
        },
        created_at: {
            type: "TIMESTAMPTZ",
            default: pgm.func("CURRENT_TIMESTAMP"),
        },
        completed_at: {
            type: "TIMESTAMPTZ",
        },
    });

    pgm.addConstraint("batches", "chk_batch_status", {
        check: "status IN ('pending', 'processing', 'completed', 'failed', 'exporting', 'exported')",
    });

    pgm.createIndex("batches", "user_id");
    pgm.createIndex("batches", "status");

    // ─── Candidates Table ───────────────────────────────
    pgm.createTable("candidates", {
        id: {
            primaryKey: true,
            type: "uuid",
            notNull: true,
            unique: true,
            default: pgm.func("uuidv7()"),
        },
        batch_id: {
            type: "uuid",
            notNull: true,
            references: "batches",
            onDelete: "CASCADE",
        },
        name: {
            type: "TEXT",
            notNull: true,
            default: "",
        },
        email: {
            type: "TEXT",
            notNull: true,
            default: "",
        },
        phone: {
            type: "TEXT",
            notNull: true,
            default: "",
        },
        skills: {
            type: "TEXT[]",
            notNull: true,
            default: "{}",
        },
        experience_years: {
            type: "TEXT",
            notNull: true,
            default: "",
        },
        education: {
            type: "TEXT[]",
            notNull: true,
            default: "{}",
        },
        companies: {
            type: "TEXT[]",
            notNull: true,
            default: "{}",
        },
        location: {
            type: "TEXT",
            notNull: true,
            default: "",
        },
        file_key: {
            type: "TEXT",
            notNull: true,
        },
        file_size: {
            type: "INTEGER",
            notNull: true,
            default: 0,
        },
        character_count: {
            type: "INTEGER",
            notNull: true,
            default: 0,
        },
        status: {
            type: "VARCHAR(20)",
            notNull: true,
            default: "pending",
        },
        error_message: {
            type: "TEXT",
        },
        created_at: {
            type: "TIMESTAMPTZ",
            default: pgm.func("CURRENT_TIMESTAMP"),
        },
    });

    pgm.addConstraint("candidates", "chk_candidate_status", {
        check: "status IN ('pending', 'processing', 'completed', 'failed')",
    });

    pgm.createIndex("candidates", "batch_id");
    pgm.createIndex("candidates", "status");

    // ─── User Device Tracking ───────────────────────────
    pgm.addColumns("users", {
        device_id: {
            type: "VARCHAR(255)",
        },
    });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropColumns("users", ["device_id"]);
    pgm.dropTable("candidates");
    pgm.dropTable("batches");
}
