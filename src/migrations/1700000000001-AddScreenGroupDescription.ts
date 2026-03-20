import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddScreenGroupDescription1700000000001 implements MigrationInterface {
  name = 'AddScreenGroupDescription1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "screen_groups"
      ADD COLUMN IF NOT EXISTS "description" character varying
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "screen_groups"
      DROP COLUMN IF EXISTS "description"
    `);
  }
}
