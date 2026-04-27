import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1759418214312 implements MigrationInterface {
  name = 'Migration1759418214312';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "roles" ADD "description" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "description"`);
  }
}
