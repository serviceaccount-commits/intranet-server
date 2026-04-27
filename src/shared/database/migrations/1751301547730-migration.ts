import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1751301547730 implements MigrationInterface {
    name = 'Migration1751301547730'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "email_verified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "work_phone" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "work_phone" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "email_verified"`);
    }

}
