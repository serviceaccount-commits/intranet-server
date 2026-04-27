"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1761234929451 = void 0;
class Migration1761234929451 {
    name = 'Migration1761234929451';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_details" ADD "works_in_im" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user_details" ADD "works_in_flx" boolean NOT NULL DEFAULT false`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_details" DROP COLUMN "works_in_flx"`);
        await queryRunner.query(`ALTER TABLE "user_details" DROP COLUMN "works_in_im"`);
    }
}
exports.Migration1761234929451 = Migration1761234929451;
//# sourceMappingURL=1761234929451-migration.js.map