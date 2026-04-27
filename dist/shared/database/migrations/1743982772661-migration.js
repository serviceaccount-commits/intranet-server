"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1743982772661 = void 0;
class Migration1743982772661 {
    name = 'Migration1743982772661';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "courses" ADD "user_id" uuid`);
        await queryRunner.query(`CREATE INDEX "IDX_a4396a5235f159ab156a6f8b60" ON "courses" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_a4396a5235f159ab156a6f8b603" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_a4396a5235f159ab156a6f8b603"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a4396a5235f159ab156a6f8b60"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "user_id"`);
    }
}
exports.Migration1743982772661 = Migration1743982772661;
//# sourceMappingURL=1743982772661-migration.js.map