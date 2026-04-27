import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1760542336655 implements MigrationInterface {
  name = 'Migration1760542336655';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "articles" ADD "available_for_client" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "articles" DROP COLUMN "available_for_client"`,
    );
  }
}
