import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1757028905295 implements MigrationInterface {
  name = 'Migration1757028905295';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "articles" ADD "embedding" vector(768)`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "embedding"`);
  }
}
