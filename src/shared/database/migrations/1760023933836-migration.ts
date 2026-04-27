import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1760023933836 implements MigrationInterface {
  name = 'Migration1760023933836';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."permissions_app_module_enum" RENAME TO "permissions_app_module_enum_old"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."permissions_app_module_enum" AS ENUM('knowledge-base', 'staff-directory', 'announcements', 'training', 'profile', 'admin')`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ALTER COLUMN "app_module" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ALTER COLUMN "app_module" TYPE "public"."permissions_app_module_enum" USING "app_module"::"text"::"public"."permissions_app_module_enum"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ALTER COLUMN "app_module" SET DEFAULT 'knowledge-base'`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."permissions_app_module_enum_old"`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."permissions_app_module_enum_old" AS ENUM('knowledge-base', 'announcements', 'training', 'profile', 'admin')`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ALTER COLUMN "app_module" DROP DEFAULT`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ALTER COLUMN "app_module" TYPE "public"."permissions_app_module_enum_old" USING "app_module"::"text"::"public"."permissions_app_module_enum_old"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ALTER COLUMN "app_module" SET DEFAULT 'knowledge-base'`,
    );
    await queryRunner.query(`DROP TYPE "public"."permissions_app_module_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."permissions_app_module_enum_old" RENAME TO "permissions_app_module_enum"`,
    );
  }
}
