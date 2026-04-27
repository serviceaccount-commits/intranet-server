"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1744236967488 = void 0;
class Migration1744236967488 {
    name = 'Migration1744236967488';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "classes" ADD "document_id" uuid`);
        await queryRunner.query(`ALTER TABLE "classes" ADD CONSTRAINT "UQ_e1afc9b14961862cd81bcb51845" UNIQUE ("document_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_e1afc9b14961862cd81bcb5184" ON "classes" ("document_id") `);
        await queryRunner.query(`ALTER TABLE "classes" ADD CONSTRAINT "FK_e1afc9b14961862cd81bcb51845" FOREIGN KEY ("document_id") REFERENCES "documents"("document_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "classes" DROP CONSTRAINT "FK_e1afc9b14961862cd81bcb51845"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e1afc9b14961862cd81bcb5184"`);
        await queryRunner.query(`ALTER TABLE "classes" DROP CONSTRAINT "UQ_e1afc9b14961862cd81bcb51845"`);
        await queryRunner.query(`ALTER TABLE "classes" DROP COLUMN "document_id"`);
    }
}
exports.Migration1744236967488 = Migration1744236967488;
//# sourceMappingURL=1744236967488-migration.js.map