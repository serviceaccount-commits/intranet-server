"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1761323302369 = void 0;
class Migration1761323302369 {
    name = 'Migration1761323302369';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_details" DROP COLUMN "works_in_im"`);
        await queryRunner.query(`ALTER TABLE "user_details" DROP COLUMN "works_in_flx"`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "is_im" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "is_flx" boolean NOT NULL DEFAULT false`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "is_flx"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "is_im"`);
        await queryRunner.query(`ALTER TABLE "user_details" ADD "works_in_flx" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "user_details" ADD "works_in_im" boolean NOT NULL DEFAULT false`);
    }
}
exports.Migration1761323302369 = Migration1761323302369;
//# sourceMappingURL=1761323302369-migration.js.map