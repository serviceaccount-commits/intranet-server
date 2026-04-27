import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1758234742507 implements MigrationInterface {
  name = 'Migration1758234742507';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."announcements_type_enum" AS ENUM('regular', 'persistent')`,
    );
    await queryRunner.query(
      `ALTER TABLE "announcements" ADD "type" "public"."announcements_type_enum" NOT NULL DEFAULT 'regular'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "announcements" DROP COLUMN "type"`);
    await queryRunner.query(`DROP TYPE "public"."announcements_type_enum"`);
  }
}
