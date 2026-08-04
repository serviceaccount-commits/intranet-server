import { MigrationInterface, QueryRunner } from 'typeorm';

// Onboarding tour completion flag. NULL = the user has not completed
// (or dismissed) the onboarding tour yet, so every existing user sees
// the welcome dialog once on their next login.
export class Migration1785801600000 implements MigrationInterface {
  name = 'Migration1785801600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "onboarding_completed_at" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "onboarding_completed_at"`,
    );
  }
}
