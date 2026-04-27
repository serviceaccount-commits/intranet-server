import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1744219025974 implements MigrationInterface {
    name = 'Migration1744219025974'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."courses_course_status_enum" AS ENUM('active', 'inactive')`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "course_status" "public"."courses_course_status_enum" NOT NULL DEFAULT 'active'`);
        await queryRunner.query(`CREATE TYPE "public"."training_topics_topic_status_enum" AS ENUM('active', 'inactive')`);
        await queryRunner.query(`ALTER TABLE "training_topics" ADD "topic_status" "public"."training_topics_topic_status_enum" NOT NULL DEFAULT 'active'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "training_topics" DROP COLUMN "topic_status"`);
        await queryRunner.query(`DROP TYPE "public"."training_topics_topic_status_enum"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "course_status"`);
        await queryRunner.query(`DROP TYPE "public"."courses_course_status_enum"`);
    }

}
