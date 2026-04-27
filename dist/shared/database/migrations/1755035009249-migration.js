"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1755035009249 = void 0;
class Migration1755035009249 {
    name = 'Migration1755035009249';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "question_types" ADD CONSTRAINT "UQ_204889918152f7317b81ca1e6f2" UNIQUE ("type_name")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "question_types" DROP CONSTRAINT "UQ_204889918152f7317b81ca1e6f2"`);
    }
}
exports.Migration1755035009249 = Migration1755035009249;
//# sourceMappingURL=1755035009249-migration.js.map