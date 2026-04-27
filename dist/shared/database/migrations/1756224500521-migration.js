"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1756224500521 = void 0;
class Migration1756224500521 {
    name = 'Migration1756224500521';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "announcement_read" ("user_id" uuid NOT NULL, "announcement_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5a2ad70aa54b704b484fcbbb008" PRIMARY KEY ("user_id", "announcement_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e1f713592723393bdd0abec20f" ON "announcement_read" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_cf3946278b58639abffd1592be" ON "announcement_read" ("announcement_id") `);
        await queryRunner.query(`ALTER TABLE "announcement_read" ADD CONSTRAINT "FK_e1f713592723393bdd0abec20fb" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "announcement_read" ADD CONSTRAINT "FK_cf3946278b58639abffd1592be3" FOREIGN KEY ("announcement_id") REFERENCES "announcements"("announcement_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "announcement_read" DROP CONSTRAINT "FK_cf3946278b58639abffd1592be3"`);
        await queryRunner.query(`ALTER TABLE "announcement_read" DROP CONSTRAINT "FK_e1f713592723393bdd0abec20fb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cf3946278b58639abffd1592be"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e1f713592723393bdd0abec20f"`);
        await queryRunner.query(`DROP TABLE "announcement_read"`);
    }
}
exports.Migration1756224500521 = Migration1756224500521;
//# sourceMappingURL=1756224500521-migration.js.map