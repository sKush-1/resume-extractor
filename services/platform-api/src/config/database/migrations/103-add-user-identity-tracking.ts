import type { MigrationBuilder } from "node-pg-migrate";

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.addColumns("users", {
        last_ip: {
            type: "VARCHAR(45)",
            notNull: false,
        },
        fingerprint: {
            type: "TEXT",
            notNull: false,
        },
    });

    pgm.createIndex("users", "last_ip");
    pgm.createIndex("users", "fingerprint");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropIndex("users", "fingerprint");
    pgm.dropIndex("users", "last_ip");
    pgm.dropColumns("users", ["last_ip", "fingerprint"]);
}
