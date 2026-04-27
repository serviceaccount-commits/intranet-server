import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1761234929451 implements MigrationInterface {
  name = 'Migration1761234929451';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_details" ADD "works_in_im" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_details" ADD "works_in_flx" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_details" DROP COLUMN "works_in_flx"`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_details" DROP COLUMN "works_in_im"`,
    );
  }
}
