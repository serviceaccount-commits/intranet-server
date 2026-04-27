"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1747868219006 = void 0;
class Migration1747868219006 {
    name = 'Migration1747868219006';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "announcement_assigned_to_users" ("user_id" uuid NOT NULL, "announcement_id" uuid NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f3f78da8232b4b54ce59251ac38" PRIMARY KEY ("user_id", "announcement_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5f99cf5b87874fa13e73e89a0b" ON "announcement_assigned_to_users" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_61164db4afb2e82c4143883280" ON "announcement_assigned_to_users" ("announcement_id") `);
        await queryRunner.query(`ALTER TABLE "announcement_assigned_to_users" ADD CONSTRAINT "FK_5f99cf5b87874fa13e73e89a0be" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "announcement_assigned_to_users" ADD CONSTRAINT "FK_61164db4afb2e82c41438832807" FOREIGN KEY ("announcement_id") REFERENCES "announcements"("announcement_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "announcement_assigned_to_users" DROP CONSTRAINT "FK_61164db4afb2e82c41438832807"`);
        await queryRunner.query(`ALTER TABLE "announcement_assigned_to_users" DROP CONSTRAINT "FK_5f99cf5b87874fa13e73e89a0be"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_61164db4afb2e82c4143883280"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5f99cf5b87874fa13e73e89a0b"`);
        await queryRunner.query(`DROP TABLE "announcement_assigned_to_users"`);
    }
}
exports.Migration1747868219006 = Migration1747868219006;
//# sourceMappingURL=1747868219006-migration.js.map