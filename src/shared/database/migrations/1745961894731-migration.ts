import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1745961894731 implements MigrationInterface {
    name = 'Migration1745961894731'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clients" ADD CONSTRAINT "UQ_22f7e5f9138149a624c88dfcc84" UNIQUE ("client_name")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "clients" DROP CONSTRAINT "UQ_22f7e5f9138149a624c88dfcc84"`);
    }

}
