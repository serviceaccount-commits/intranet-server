import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1743798644762 implements MigrationInterface {
    name = 'Migration1743798644762'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "reporting_to_id" uuid`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "reporting_to_id"`);
    }

}
