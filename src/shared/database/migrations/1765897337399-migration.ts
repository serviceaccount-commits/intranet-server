import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1765897337399 implements MigrationInterface {
  name = 'Migration1765897337399';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "standalone_exams" ADD "awaiting_approval_at" TIMESTAMP`,
    );
    await queryRunner.query(
      `ALTER TABLE "standalone_exams" ADD "approved_at" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "standalone_exams" DROP COLUMN "approved_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "standalone_exams" DROP COLUMN "awaiting_approval_at"`,
    );
  }
}
