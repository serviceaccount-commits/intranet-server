import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1764796738700 implements MigrationInterface {
  name = 'Migration1764796738700';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."article_versions_article_status_enum" RENAME TO "article_versions_article_status_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."article_versions_article_status_enum" AS ENUM('published', 'draft', 'outdated', 'unpublished')`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_versions" ALTER COLUMN "article_status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_versions" ALTER COLUMN "article_status" TYPE "public"."article_versions_article_status_enum" USING "article_status"::"text"::"public"."article_versions_article_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_versions" ALTER COLUMN "article_status" SET DEFAULT 'draft'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."article_versions_article_status_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."article_versions_article_status_enum_old" AS ENUM('published', 'draft', 'outdated')`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_versions" ALTER COLUMN "article_status" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_versions" ALTER COLUMN "article_status" TYPE "public"."article_versions_article_status_enum_old" USING "article_status"::"text"::"public"."article_versions_article_status_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "article_versions" ALTER COLUMN "article_status" SET DEFAULT 'draft'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."article_versions_article_status_enum"`,
    );
    await queryRunner.query(
      `ALTER TYPE "public"."article_versions_article_status_enum_old" RENAME TO "article_versions_article_status_enum"`,
    );
  }
}
