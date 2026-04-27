"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1755053140067 = void 0;
class Migration1755053140067 {
    name = 'Migration1755053140067';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "options" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "questions" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "questions" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "options" DROP COLUMN "created_at"`);
    }
}
exports.Migration1755053140067 = Migration1755053140067;
//# sourceMappingURL=1755053140067-migration.js.map