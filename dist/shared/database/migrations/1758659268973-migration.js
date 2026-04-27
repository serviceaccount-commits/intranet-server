"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1758659268973 = void 0;
class Migration1758659268973 {
    name = 'Migration1758659268973';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "permissions" DROP COLUMN "permission_name"`);
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_17022daf3f885f7d35423e9971e"`);
        await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "permission_id" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "permissions_permission_id_seq"`);
        await queryRunner.query(`ALTER TABLE "permissions" DROP COLUMN "app_module"`);
        await queryRunner.query(`CREATE TYPE "public"."permissions_app_module_enum" AS ENUM('knowledge-base', 'announcements', 'training', 'profile', 'admin')`);
        await queryRunner.query(`ALTER TABLE "permissions" ADD "app_module" "public"."permissions_app_module_enum" NOT NULL DEFAULT 'knowledge-base'`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_17022daf3f885f7d35423e9971e" FOREIGN KEY ("permission_id") REFERENCES "permissions"("permission_id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_17022daf3f885f7d35423e9971e"`);
        await queryRunner.query(`ALTER TABLE "permissions" DROP COLUMN "app_module"`);
        await queryRunner.query(`DROP TYPE "public"."permissions_app_module_enum"`);
        await queryRunner.query(`ALTER TABLE "permissions" ADD "app_module" character varying NOT NULL`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "permissions_permission_id_seq" OWNED BY "permissions"."permission_id"`);
        await queryRunner.query(`ALTER TABLE "permissions" ALTER COLUMN "permission_id" SET DEFAULT nextval('"permissions_permission_id_seq"')`);
        await queryRunner.query(`ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_17022daf3f885f7d35423e9971e" FOREIGN KEY ("permission_id") REFERENCES "permissions"("permission_id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "permissions" ADD "permission_name" character varying NOT NULL`);
    }
}
exports.Migration1758659268973 = Migration1758659268973;
//# sourceMappingURL=1758659268973-migration.js.map