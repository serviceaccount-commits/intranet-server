"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1760564581012 = void 0;
class Migration1760564581012 {
    name = 'Migration1760564581012';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."clients_region_enum" AS ENUM('us', 'co')`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "region" "public"."clients_region_enum" NOT NULL DEFAULT 'us'`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "region"`);
        await queryRunner.query(`DROP TYPE "public"."clients_region_enum"`);
    }
}
exports.Migration1760564581012 = Migration1760564581012;
//# sourceMappingURL=1760564581012-migration.js.map