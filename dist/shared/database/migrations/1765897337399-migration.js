"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1765897337399 = void 0;
class Migration1765897337399 {
    name = 'Migration1765897337399';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "standalone_exams" ADD "awaiting_approval_at" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "standalone_exams" ADD "approved_at" TIMESTAMP`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "standalone_exams" DROP COLUMN "approved_at"`);
        await queryRunner.query(`ALTER TABLE "standalone_exams" DROP COLUMN "awaiting_approval_at"`);
    }
}
exports.Migration1765897337399 = Migration1765897337399;
//# sourceMappingURL=1765897337399-migration.js.map