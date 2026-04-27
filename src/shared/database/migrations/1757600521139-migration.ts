import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1757600521139 implements MigrationInterface {
  name = 'Migration1757600521139';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "articles" ADD "article_synopsis" character varying NOT NULL DEFAULT ''`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "articles" DROP COLUMN "article_synopsis"`,
    );
  }
}
