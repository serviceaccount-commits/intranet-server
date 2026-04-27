import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1754317129763 implements MigrationInterface {
    name = 'Migration1754317129763'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exams" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "exams" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exams" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "exams" DROP COLUMN "created_at"`);
    }

}
