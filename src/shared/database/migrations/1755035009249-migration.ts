import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1755035009249 implements MigrationInterface {
    name = 'Migration1755035009249'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "question_types" ADD CONSTRAINT "UQ_204889918152f7317b81ca1e6f2" UNIQUE ("type_name")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "question_types" DROP CONSTRAINT "UQ_204889918152f7317b81ca1e6f2"`);
    }

}
