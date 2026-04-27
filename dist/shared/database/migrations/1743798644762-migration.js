"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1743798644762 = void 0;
class Migration1743798644762 {
    name = 'Migration1743798644762';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" ADD "reporting_to_id" uuid`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "reporting_to_id"`);
    }
}
exports.Migration1743798644762 = Migration1743798644762;
//# sourceMappingURL=1743798644762-migration.js.map