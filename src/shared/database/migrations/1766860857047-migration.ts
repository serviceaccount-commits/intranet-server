import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1766860857047 implements MigrationInterface {
  name = 'Migration1766860857047';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "articles" ADD "locked_by_user_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "articles" ADD "lock_expires_at" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "articles" DROP COLUMN "lock_expires_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "articles" DROP COLUMN "locked_by_user_id"`,
    );
  }
}
