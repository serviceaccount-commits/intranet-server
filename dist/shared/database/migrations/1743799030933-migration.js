"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1743799030933 = void 0;
class Migration1743799030933 {
    name = 'Migration1743799030933';
    async up(queryRunner) {
        await queryRunner.query(`CREATE INDEX "IDX_ef2fb839248017665e5033e730" ON "users" ("first_name") `);
        await queryRunner.query(`CREATE INDEX "IDX_0408cb491623b121499d4fa238" ON "users" ("last_name") `);
        await queryRunner.query(`CREATE INDEX "IDX_bfdc1638ad4f831a90e5300364" ON "users" ("work_email") `);
        await queryRunner.query(`CREATE INDEX "IDX_29cd86415ee7d2c202e5a52066" ON "users" ("selectable_as_leader") `);
        await queryRunner.query(`CREATE INDEX "IDX_fcae649d1b01de4a5befc8114e" ON "users" ("user_details_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_a2cecd1a3531c0b041e29ba46e" ON "users" ("role_id") `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "public"."IDX_a2cecd1a3531c0b041e29ba46e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fcae649d1b01de4a5befc8114e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_29cd86415ee7d2c202e5a52066"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bfdc1638ad4f831a90e5300364"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0408cb491623b121499d4fa238"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ef2fb839248017665e5033e730"`);
    }
}
exports.Migration1743799030933 = Migration1743799030933;
//# sourceMappingURL=1743799030933-migration.js.map