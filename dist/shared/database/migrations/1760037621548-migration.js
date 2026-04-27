"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1760037621548 = void 0;
class Migration1760037621548 {
    name = 'Migration1760037621548';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "roles" ADD "is_base_role" boolean NOT NULL DEFAULT false`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "is_base_role"`);
    }
}
exports.Migration1760037621548 = Migration1760037621548;
//# sourceMappingURL=1760037621548-migration.js.map