"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1743323884512 = void 0;
class Migration1743323884512 {
    name = 'Migration1743323884512';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "classes" ADD "user_id" uuid`);
        await queryRunner.query(`CREATE INDEX "IDX_955ac25b387802b256a3e35aa9" ON "classes" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "classes" ADD CONSTRAINT "FK_955ac25b387802b256a3e35aa95" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "classes" DROP CONSTRAINT "FK_955ac25b387802b256a3e35aa95"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_955ac25b387802b256a3e35aa9"`);
        await queryRunner.query(`ALTER TABLE "classes" DROP COLUMN "user_id"`);
    }
}
exports.Migration1743323884512 = Migration1743323884512;
//# sourceMappingURL=1743323884512-migration.js.map