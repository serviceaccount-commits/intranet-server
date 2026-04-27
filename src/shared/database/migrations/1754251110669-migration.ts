import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1754251110669 implements MigrationInterface {
    name = 'Migration1754251110669'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exams" ADD "max_attempts" integer NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exams" DROP COLUMN "max_attempts"`);
    }

}
