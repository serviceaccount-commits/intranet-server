import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1758899742693 implements MigrationInterface {
  name = 'Migration1758899742693';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "article_versions" DROP COLUMN "published_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_versions" ADD "published_at" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "article_versions" DROP COLUMN "published_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_versions" ADD "published_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }
}
