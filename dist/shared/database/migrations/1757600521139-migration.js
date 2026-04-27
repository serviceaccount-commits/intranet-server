"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1757600521139 = void 0;
class Migration1757600521139 {
    name = 'Migration1757600521139';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "articles" ADD "article_synopsis" character varying NOT NULL DEFAULT ''`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "article_synopsis"`);
    }
}
exports.Migration1757600521139 = Migration1757600521139;
//# sourceMappingURL=1757600521139-migration.js.map