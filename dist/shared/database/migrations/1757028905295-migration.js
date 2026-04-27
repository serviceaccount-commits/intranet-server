"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1757028905295 = void 0;
class Migration1757028905295 {
    name = 'Migration1757028905295';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "articles" ADD "embedding" vector(768)`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "embedding"`);
    }
}
exports.Migration1757028905295 = Migration1757028905295;
//# sourceMappingURL=1757028905295-migration.js.map