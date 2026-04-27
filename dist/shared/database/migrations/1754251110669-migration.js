"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1754251110669 = void 0;
class Migration1754251110669 {
    name = 'Migration1754251110669';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "exams" ADD "max_attempts" integer NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "exams" DROP COLUMN "max_attempts"`);
    }
}
exports.Migration1754251110669 = Migration1754251110669;
//# sourceMappingURL=1754251110669-migration.js.map