import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1755053140067 implements MigrationInterface {
    name = 'Migration1755053140067'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "options" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "questions" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questions" DROP COLUMN "created_at"`);
        await queryRunner.query(`ALTER TABLE "options" DROP COLUMN "created_at"`);
    }

}
