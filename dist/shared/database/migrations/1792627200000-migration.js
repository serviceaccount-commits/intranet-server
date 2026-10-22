"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1792627200000 = void 0;
/** Adds 'time-tracking' to the app_module enum (Paricus Time Tracker integration). */
class Migration1792627200000 {
    name = 'Migration1792627200000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TYPE "public"."permissions_app_module_enum" RENAME TO "permissions_app_module_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."permissions_app_module_enum" AS ENUM('knowledge-base', 'staff-directory', 'announcements', 'training', 'profile', 'time-tracking', 'admin')`);
        await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "app_module" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "app_module" TYPE "public"."permissions_app_module_enum" USING "app_module"::"text"::"public"."permissions_app_module_enum"`);
        await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "app_module" SET DEFAULT 'knowledge-base'`);
        await queryRunner.query(`DROP TYPE "public"."permissions_app_module_enum_old"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DELETE FROM "permissions" WHERE "app_module" = 'time-tracking'`);
        await queryRunner.query(`CREATE TYPE "public"."permissions_app_module_enum_old" AS ENUM('knowledge-base', 'staff-directory', 'announcements', 'training', 'profile', 'admin')`);
        await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "app_module" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "app_module" TYPE "public"."permissions_app_module_enum_old" USING "app_module"::"text"::"public"."permissions_app_module_enum_old"`);
        await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "app_module" SET DEFAULT 'knowledge-base'`);
        await queryRunner.query(`DROP TYPE "public"."permissions_app_module_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."permissions_app_module_enum_old" RENAME TO "permissions_app_module_enum"`);
    }
}
exports.Migration1792627200000 = Migration1792627200000;
//# sourceMappingURL=1792627200000-migration.js.map