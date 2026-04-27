"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1758234742507 = void 0;
class Migration1758234742507 {
    name = 'Migration1758234742507';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."announcements_type_enum" AS ENUM('regular', 'persistent')`);
        await queryRunner.query(`ALTER TABLE "announcements" ADD "type" "public"."announcements_type_enum" NOT NULL DEFAULT 'regular'`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "announcements" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."announcements_type_enum"`);
    }
}
exports.Migration1758234742507 = Migration1758234742507;
//# sourceMappingURL=1758234742507-migration.js.map