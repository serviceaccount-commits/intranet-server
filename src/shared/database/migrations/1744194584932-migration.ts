import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1744194584932 implements MigrationInterface {
    name = 'Migration1744194584932'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "class_user_values" DROP COLUMN "topic_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "class_user_values" ADD "topic_id" character varying`);
    }

}
