"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1755099845257 = void 0;
class Migration1755099845257 {
    name = 'Migration1755099845257';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."options_status_enum" AS ENUM('active', 'inactive')`);
        await queryRunner.query(`ALTER TABLE "options" ADD "status" "public"."options_status_enum" NOT NULL DEFAULT 'active'`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "options" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."options_status_enum"`);
    }
}
exports.Migration1755099845257 = Migration1755099845257;
//# sourceMappingURL=1755099845257-migration.js.map