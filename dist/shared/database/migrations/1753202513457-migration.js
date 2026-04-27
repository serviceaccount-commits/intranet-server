"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1753202513457 = void 0;
class Migration1753202513457 {
    name = 'Migration1753202513457';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "article_edit_available"`);
        await queryRunner.query(`ALTER TABLE "articles" ADD "lockedByUserId" character varying`);
        await queryRunner.query(`ALTER TABLE "articles" ADD "lockExpiresAt" TIMESTAMP`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "lockExpiresAt"`);
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "lockedByUserId"`);
        await queryRunner.query(`ALTER TABLE "articles" ADD "article_edit_available" boolean NOT NULL DEFAULT true`);
    }
}
exports.Migration1753202513457 = Migration1753202513457;
//# sourceMappingURL=1753202513457-migration.js.map