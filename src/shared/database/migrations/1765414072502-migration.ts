import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1765414072502 implements MigrationInterface {
  name = 'Migration1765414072502';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."clients_entity_enum" AS ENUM('paricus-llc', 'paricus-colombia')`,
    );
    await queryRunner.query(
      `ALTER TABLE "clients" ADD "entity" "public"."clients_entity_enum" NOT NULL DEFAULT 'paricus-llc'`,
    );
    await queryRunner.query(
      `ALTER TABLE "clients" ADD "address" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "clients" ADD CONSTRAINT "UQ_663ef24cff96c52e43d3148f29f" UNIQUE ("address")`,
    );
    await queryRunner.query(
      `ALTER TABLE "clients" ADD "primary_contact_name" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "clients" ADD "primary_contact_email" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "clients" ADD CONSTRAINT "UQ_8ee2741ae051e538761acf99970" UNIQUE ("primary_contact_email")`,
    );
    await queryRunner.query(
      `ALTER TABLE "clients" ADD "primary_contact_phone" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "clients" ADD CONSTRAINT "UQ_49237b743d4115155b7524e21ab" UNIQUE ("primary_contact_phone")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "clients" DROP CONSTRAINT "UQ_49237b743d4115155b7524e21ab"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clients" DROP COLUMN "primary_contact_phone"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clients" DROP CONSTRAINT "UQ_8ee2741ae051e538761acf99970"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clients" DROP COLUMN "primary_contact_email"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clients" DROP COLUMN "primary_contact_name"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clients" DROP CONSTRAINT "UQ_663ef24cff96c52e43d3148f29f"`,
    );
    await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "address"`);
    await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "entity"`);
    await queryRunner.query(`DROP TYPE "public"."clients_entity_enum"`);
  }
}
