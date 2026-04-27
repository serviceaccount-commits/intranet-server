import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1760037621548 implements MigrationInterface {
  name = 'Migration1760037621548';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "roles" ADD "is_base_role" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "is_base_role"`);
  }
}
