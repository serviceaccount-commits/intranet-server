import { MigrationInterface, QueryRunner } from 'typeorm';

// Currency a client is billed in, chosen per client instead of inferred from
// its country. Existing rows are backfilled with what the entity used to
// imply (Paricus Colombia = COP, everything else = USD), so behaviour is
// unchanged until someone edits a client on purpose.
export class Migration1785888000000 implements MigrationInterface {
  name = 'Migration1785888000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."clients_currency_enum" AS ENUM('COP', 'USD')`,
    );
    await queryRunner.query(
      `ALTER TABLE "clients" ADD "currency" "public"."clients_currency_enum" NOT NULL DEFAULT 'USD'`,
    );
    await queryRunner.query(
      `UPDATE "clients" SET "currency" = 'COP' WHERE "entity" = 'paricus-colombia'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "currency"`);
    await queryRunner.query(`DROP TYPE "public"."clients_currency_enum"`);
  }
}
