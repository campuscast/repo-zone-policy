import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Real initial migration for zone_policy_db.
 * Tables: zones, screen_groups, zone_policies
 */
export class Init1700000000000 implements MigrationInterface {
  name = 'Init1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,
    );

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "zones" (
        "zone_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_zones" PRIMARY KEY ("zone_id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "screen_groups" (
        "group_id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "zone_id" uuid NOT NULL,
        "name" character varying NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_screen_groups" PRIMARY KEY ("group_id"),
        CONSTRAINT "FK_screen_groups_zone" FOREIGN KEY ("zone_id")
          REFERENCES "zones"("zone_id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "zone_policies" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "zone_id" character varying NOT NULL,
        "max_schedule_slots" integer NOT NULL DEFAULT 100,
        "max_content_size_mb" integer NOT NULL DEFAULT 500,
        "allowed_content_types" text DEFAULT 'video/mp4,image/png,image/jpeg',
        "crdt_enabled" boolean NOT NULL DEFAULT false,
        "max_ops_per_minute" integer NOT NULL DEFAULT 60,
        "max_batch_size" integer NOT NULL DEFAULT 50,
        "priority_rules" jsonb NOT NULL DEFAULT '[]',
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_zone_policies" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_zone_policies_zone_id" UNIQUE ("zone_id")
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "zone_policies"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "screen_groups"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "zones"`);
  }
}
