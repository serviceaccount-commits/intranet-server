import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1764613158783 implements MigrationInterface {
  name = 'Migration1764613158783';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "courses" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "updated_at"`);
  }
}
