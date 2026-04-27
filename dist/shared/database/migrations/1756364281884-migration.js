"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1756364281884 = void 0;
class Migration1756364281884 {
    name = 'Migration1756364281884';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "work_phone" SET NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "work_phone" DROP NOT NULL`);
    }
}
exports.Migration1756364281884 = Migration1756364281884;
//# sourceMappingURL=1756364281884-migration.js.map