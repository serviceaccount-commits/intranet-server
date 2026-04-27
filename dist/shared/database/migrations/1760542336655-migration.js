"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1760542336655 = void 0;
class Migration1760542336655 {
    name = 'Migration1760542336655';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "articles" ADD "available_for_client" boolean NOT NULL DEFAULT false`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "available_for_client"`);
    }
}
exports.Migration1760542336655 = Migration1760542336655;
//# sourceMappingURL=1760542336655-migration.js.map