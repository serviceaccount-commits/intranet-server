"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1754317129763 = void 0;
class Migration1754317129763 {
    name = 'Migration1754317129763';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "exams" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "exams" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "exams" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "exams" DROP COLUMN "created_at"`);
    }
}
exports.Migration1754317129763 = Migration1754317129763;
//# sourceMappingURL=1754317129763-migration.js.map