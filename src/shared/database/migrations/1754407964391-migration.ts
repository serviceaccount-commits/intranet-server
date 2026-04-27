import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1754407964391 implements MigrationInterface {
    name = 'Migration1754407964391'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_answers" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user_answers" ADD "updated_at" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_answers" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "user_answers" DROP COLUMN "created_at"`);
    }

}
