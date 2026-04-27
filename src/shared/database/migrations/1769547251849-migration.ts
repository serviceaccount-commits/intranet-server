import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1769547251849 implements MigrationInterface {
  name = 'Migration1769547251849';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "last_activity_at" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "last_activity_at" DROP DEFAULT`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "last_activity_at" SET DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "last_activity_at" SET NOT NULL`,
    );
  }
}
