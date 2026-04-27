"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1760023933836 = void 0;
class Migration1760023933836 {
    name = 'Migration1760023933836';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TYPE "public"."permissions_app_module_enum" RENAME TO "permissions_app_module_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."permissions_app_module_enum" AS ENUM('knowledge-base', 'staff-directory', 'announcements', 'training', 'profile', 'admin')`);
        await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "app_module" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "app_module" TYPE "public"."permissions_app_module_enum" USING "app_module"::"text"::"public"."permissions_app_module_enum"`);
        await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "app_module" SET DEFAULT 'knowledge-base'`);
        await queryRunner.query(`DROP TYPE "public"."permissions_app_module_enum_old"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."permissions_app_module_enum_old" AS ENUM('knowledge-base', 'announcements', 'training', 'profile', 'admin')`);
        await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "app_module" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "app_module" TYPE "public"."permissions_app_module_enum_old" USING "app_module"::"text"::"public"."permissions_app_module_enum_old"`);
        await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "app_module" SET DEFAULT 'knowledge-base'`);
        await queryRunner.query(`DROP TYPE "public"."permissions_app_module_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."permissions_app_module_enum_old" RENAME TO "permissions_app_module_enum"`);
    }
}
exports.Migration1760023933836 = Migration1760023933836;
//# sourceMappingURL=1760023933836-migration.js.map