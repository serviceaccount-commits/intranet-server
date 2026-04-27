"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1766860857047 = void 0;
class Migration1766860857047 {
    name = 'Migration1766860857047';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "articles" ADD "locked_by_user_id" character varying`);
        await queryRunner.query(`ALTER TABLE "articles" ADD "lock_expires_at" TIMESTAMP`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "lock_expires_at"`);
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "locked_by_user_id"`);
    }
}
exports.Migration1766860857047 = Migration1766860857047;
//# sourceMappingURL=1766860857047-migration.js.map