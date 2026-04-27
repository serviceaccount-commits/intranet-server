"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1764613158783 = void 0;
class Migration1764613158783 {
    name = 'Migration1764613158783';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "courses" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "updated_at"`);
    }
}
exports.Migration1764613158783 = Migration1764613158783;
//# sourceMappingURL=1764613158783-migration.js.map