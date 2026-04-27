import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1757933833572 implements MigrationInterface {
  name = 'Migration1757933833572';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "announcements" ADD "preview" character varying NOT NULL DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "announcements" DROP COLUMN "preview"`,
    );
  }
}
