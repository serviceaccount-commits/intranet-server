import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1744200301110 implements MigrationInterface {
    name = 'Migration1744200301110'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "training_topic_user_values" ADD "completed_classes_count" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "training_topic_user_values" ADD "total_classes_count" integer NOT NULL`);
        await queryRunner.query(`CREATE INDEX "IDX_85f62beccba387cd0c953c0a84" ON "training_topic_user_values" ("completed_classes_count") `);
        await queryRunner.query(`CREATE INDEX "IDX_32d65c78f86261ccbf415fb81e" ON "training_topic_user_values" ("total_classes_count") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_32d65c78f86261ccbf415fb81e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_85f62beccba387cd0c953c0a84"`);
        await queryRunner.query(`ALTER TABLE "training_topic_user_values" DROP COLUMN "total_classes_count"`);
        await queryRunner.query(`ALTER TABLE "training_topic_user_values" DROP COLUMN "completed_classes_count"`);
    }

}
