import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1755099845257 implements MigrationInterface {
    name = 'Migration1755099845257'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."options_status_enum" AS ENUM('active', 'inactive')`);
        await queryRunner.query(`ALTER TABLE "options" ADD "status" "public"."options_status_enum" NOT NULL DEFAULT 'active'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "options" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."options_status_enum"`);
    }

}
