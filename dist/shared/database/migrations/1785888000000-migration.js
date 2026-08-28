"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1785888000000 = void 0;
// Currency a client is billed in, chosen per client instead of inferred from
// its country. Existing rows are backfilled with what the entity used to
// imply (Paricus Colombia = COP, everything else = USD), so behaviour is
// unchanged until someone edits a client on purpose.
class Migration1785888000000 {
    name = 'Migration1785888000000';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."clients_currency_enum" AS ENUM('COP', 'USD')`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "currency" "public"."clients_currency_enum" NOT NULL DEFAULT 'USD'`);
        await queryRunner.query(`UPDATE "clients" SET "currency" = 'COP' WHERE "entity" = 'paricus-colombia'`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "currency"`);
        await queryRunner.query(`DROP TYPE "public"."clients_currency_enum"`);
    }
}
exports.Migration1785888000000 = Migration1785888000000;
//# sourceMappingURL=1785888000000-migration.js.map