"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1769546114926 = void 0;
class Migration1769546114926 {
    name = 'Migration1769546114926';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" ADD "last_activity_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "last_activity_at"`);
    }
}
exports.Migration1769546114926 = Migration1769546114926;
//# sourceMappingURL=1769546114926-migration.js.map