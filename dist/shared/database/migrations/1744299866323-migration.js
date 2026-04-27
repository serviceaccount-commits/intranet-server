"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1744299866323 = void 0;
class Migration1744299866323 {
    name = 'Migration1744299866323';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "class_user_values" DROP CONSTRAINT "FK_0431ac055586144044901eafe21"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0431ac055586144044901eafe2"`);
        await queryRunner.query(`ALTER TABLE "class_user_values" DROP CONSTRAINT "REL_0431ac055586144044901eafe2"`);
        await queryRunner.query(`ALTER TABLE "class_user_values" DROP COLUMN "document_id"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "class_user_values" ADD "document_id" uuid`);
        await queryRunner.query(`ALTER TABLE "class_user_values" ADD CONSTRAINT "REL_0431ac055586144044901eafe2" UNIQUE ("document_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_0431ac055586144044901eafe2" ON "class_user_values" ("document_id") `);
        await queryRunner.query(`ALTER TABLE "class_user_values" ADD CONSTRAINT "FK_0431ac055586144044901eafe21" FOREIGN KEY ("document_id") REFERENCES "documents"("document_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
}
exports.Migration1744299866323 = Migration1744299866323;
//# sourceMappingURL=1744299866323-migration.js.map