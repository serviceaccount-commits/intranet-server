import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1760546849478 implements MigrationInterface {
  name = 'Migration1760546849478';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "clients" ADD "client_shared_id" character varying`,
    );
    await queryRunner.query(
      `ALTER TABLE "clients" ADD CONSTRAINT "UQ_297816563d7abef38f3f751afe7" UNIQUE ("client_shared_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "clients" DROP CONSTRAINT "UQ_297816563d7abef38f3f751afe7"`,
    );
    await queryRunner.query(
      `ALTER TABLE "clients" DROP COLUMN "client_shared_id"`,
    );
  }
}
