"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1759854294888 = void 0;
class Migration1759854294888 {
    name = 'Migration1759854294888';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "roles" ADD "base_role_id" uuid`);
        await queryRunner.query(`ALTER TABLE "roles" ADD "parent_role_id" uuid`);
        await queryRunner.query(`CREATE INDEX "IDX_c2c7538dae16b4ad224fe13918" ON "roles" ("base_role_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_2c6e71b96bff7b9230de9dda83" ON "roles" ("parent_role_id") `);
        await queryRunner.query(`ALTER TABLE "roles" ADD CONSTRAINT "FK_c2c7538dae16b4ad224fe13918b" FOREIGN KEY ("base_role_id") REFERENCES "roles"("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "roles" ADD CONSTRAINT "FK_2c6e71b96bff7b9230de9dda83b" FOREIGN KEY ("parent_role_id") REFERENCES "roles"("role_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "FK_2c6e71b96bff7b9230de9dda83b"`);
        await queryRunner.query(`ALTER TABLE "roles" DROP CONSTRAINT "FK_c2c7538dae16b4ad224fe13918b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2c6e71b96bff7b9230de9dda83"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c2c7538dae16b4ad224fe13918"`);
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "parent_role_id"`);
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "base_role_id"`);
    }
}
exports.Migration1759854294888 = Migration1759854294888;
//# sourceMappingURL=1759854294888-migration.js.map