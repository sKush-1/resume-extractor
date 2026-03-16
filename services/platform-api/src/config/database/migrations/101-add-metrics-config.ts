import type { MigrationBuilder } from "node-pg-migrate";

export const shorthands = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
    pgm.addColumns("batches", {
        metrics: {
            type: "JSONB",
            notNull: false,
        },
    });

    pgm.addColumns("candidates", {
        parsed_data: {
            type: "JSONB",
            notNull: false,
        },
    });
}

export async function down(pgm: MigrationBuilder): Promise<void> {
    pgm.dropColumns("candidates", ["parsed_data"]);
    pgm.dropColumns("batches", ["metrics"]);
}
