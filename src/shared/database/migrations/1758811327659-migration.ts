import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1758811327659 implements MigrationInterface {
  name = 'Migration1758811327659';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "article_versions" DROP CONSTRAINT "FK_8945d7e0314f023933e7e010bb1"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8945d7e0314f023933e7e010bb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_versions" DROP COLUMN "topic_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_versions" DROP COLUMN "article_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_versions" ADD "article_id" uuid`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6f13230b812dda9b137e00edff" ON "article_versions" ("article_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "article_versions" ADD CONSTRAINT "FK_6f13230b812dda9b137e00edff7" FOREIGN KEY ("article_id") REFERENCES "articles"("article_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "article_versions" DROP CONSTRAINT "FK_6f13230b812dda9b137e00edff7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_6f13230b812dda9b137e00edff"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_versions" DROP COLUMN "article_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_versions" ADD "article_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_versions" ADD "topic_id" uuid`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8945d7e0314f023933e7e010bb" ON "article_versions" ("topic_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "article_versions" ADD CONSTRAINT "FK_8945d7e0314f023933e7e010bb1" FOREIGN KEY ("topic_id") REFERENCES "articles"("article_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
