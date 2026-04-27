"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1757933833572 = void 0;
class Migration1757933833572 {
    name = 'Migration1757933833572';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "announcements" ADD "preview" character varying NOT NULL DEFAULT ''`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "announcements" DROP COLUMN "preview"`);
    }
}
exports.Migration1757933833572 = Migration1757933833572;
//# sourceMappingURL=1757933833572-migration.js.map