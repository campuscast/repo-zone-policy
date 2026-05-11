import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddScreenGroupLayout1700000000002 implements MigrationInterface {
  name = 'AddScreenGroupLayout1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "screen_groups"
      ADD COLUMN IF NOT EXISTS "layout_items" jsonb NOT NULL DEFAULT '[]'::jsonb
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "screen_groups"
      DROP COLUMN IF EXISTS "layout_items"
    `);
  }
}
