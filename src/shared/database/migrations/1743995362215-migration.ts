import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1743995362215 implements MigrationInterface {
    name = 'Migration1743995362215'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "training_topics" DROP COLUMN "topic_description"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "training_topics" ADD "topic_description" character varying NOT NULL`);
    }

}
