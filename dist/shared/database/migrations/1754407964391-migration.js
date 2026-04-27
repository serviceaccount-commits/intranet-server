"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1754407964391 = void 0;
class Migration1754407964391 {
    name = 'Migration1754407964391';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_answers" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user_answers" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_answers" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "user_answers" DROP COLUMN "created_at"`);
    }
}
exports.Migration1754407964391 = Migration1754407964391;
//# sourceMappingURL=1754407964391-migration.js.map