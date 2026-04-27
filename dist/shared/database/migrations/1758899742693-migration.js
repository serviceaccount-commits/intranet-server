"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1758899742693 = void 0;
class Migration1758899742693 {
    name = 'Migration1758899742693';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "article_versions" DROP COLUMN "published_at"`);
        await queryRunner.query(`ALTER TABLE "article_versions" ADD "published_at" TIMESTAMP WITH TIME ZONE`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "article_versions" DROP COLUMN "published_at"`);
        await queryRunner.query(`ALTER TABLE "article_versions" ADD "published_at" TIMESTAMP NOT NULL DEFAULT now()`);
    }
}
exports.Migration1758899742693 = Migration1758899742693;
//# sourceMappingURL=1758899742693-migration.js.map