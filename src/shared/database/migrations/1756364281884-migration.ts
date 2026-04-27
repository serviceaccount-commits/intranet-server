import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1756364281884 implements MigrationInterface {
    name = 'Migration1756364281884'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "work_phone" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "work_phone" DROP NOT NULL`);
    }

}
