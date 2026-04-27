import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1760564581012 implements MigrationInterface {
  name = 'Migration1760564581012';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."clients_region_enum" AS ENUM('us', 'co')`,
    );
    await queryRunner.query(
      `ALTER TABLE "clients" ADD "region" "public"."clients_region_enum" NOT NULL DEFAULT 'us'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "region"`);
    await queryRunner.query(`DROP TYPE "public"."clients_region_enum"`);
  }
}
