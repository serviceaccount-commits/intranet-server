import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1747916055708 implements MigrationInterface {
    name = 'Migration1747916055708'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "announcements" DROP COLUMN "open_acknowledge_until"`);
        await queryRunner.query(`ALTER TABLE "announcements" ADD "open_acknowledge_until" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "announcements" DROP COLUMN "open_acknowledge_until"`);
        await queryRunner.query(`ALTER TABLE "announcements" ADD "open_acknowledge_until" TIME WITH TIME ZONE NOT NULL DEFAULT now()`);
    }

}
