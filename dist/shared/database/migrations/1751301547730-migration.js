"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1751301547730 = void 0;
class Migration1751301547730 {
    name = 'Migration1751301547730';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" ADD "email_verified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "work_phone" DROP NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "work_phone" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email_verified"`);
    }
}
exports.Migration1751301547730 = Migration1751301547730;
//# sourceMappingURL=1751301547730-migration.js.map