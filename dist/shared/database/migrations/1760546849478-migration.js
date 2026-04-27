"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1760546849478 = void 0;
class Migration1760546849478 {
    name = 'Migration1760546849478';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "clients" ADD "client_shared_id" character varying`);
        await queryRunner.query(`ALTER TABLE "clients" ADD CONSTRAINT "UQ_297816563d7abef38f3f751afe7" UNIQUE ("client_shared_id")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "clients" DROP CONSTRAINT "UQ_297816563d7abef38f3f751afe7"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "client_shared_id"`);
    }
}
exports.Migration1760546849478 = Migration1760546849478;
//# sourceMappingURL=1760546849478-migration.js.map