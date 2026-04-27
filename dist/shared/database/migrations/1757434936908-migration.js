"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1757434936908 = void 0;
class Migration1757434936908 {
    name = 'Migration1757434936908';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "article_chunks" ("chunk_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "article_id" character varying NOT NULL, "content" text NOT NULL, "embedding" vector(768) NOT NULL, "articleArticleId" uuid, CONSTRAINT "PK_0c19ecf16635cfb2f0b84c5e198" PRIMARY KEY ("chunk_id"))`);
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "embedding"`);
        await queryRunner.query(`ALTER TABLE "article_chunks" ADD CONSTRAINT "FK_b42d7e6b8c3189f789333045fb3" FOREIGN KEY ("articleArticleId") REFERENCES "articles"("article_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "article_chunks" DROP CONSTRAINT "FK_b42d7e6b8c3189f789333045fb3"`);
        await queryRunner.query(`ALTER TABLE "articles" ADD "embedding" vector(768)`);
        await queryRunner.query(`DROP TABLE "article_chunks"`);
    }
}
exports.Migration1757434936908 = Migration1757434936908;
//# sourceMappingURL=1757434936908-migration.js.map