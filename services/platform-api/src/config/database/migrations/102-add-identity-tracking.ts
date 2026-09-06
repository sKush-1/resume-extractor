import type { MigrationBuilder } from "node-pg-migrate";

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.addColumns("batches", {
        ip_address: {
            type: "VARCHAR(45)",
            notNull: false,
        },
        fingerprint: {
            type: "TEXT",
            notNull: false,
        },
    });

    pgm.createIndex("batches", "ip_address");
    pgm.createIndex("batches", "fingerprint");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropIndex("batches", "fingerprint");
    pgm.dropIndex("batches", "ip_address");
    pgm.dropColumns("batches", ["ip_address", "fingerprint"]);
}
