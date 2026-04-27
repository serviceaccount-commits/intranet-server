import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1752597177945 implements MigrationInterface {
    name = 'Migration1752597177945'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."training_topics_topic_status_enum" RENAME TO "training_topics_topic_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."training_topics_topic_status_enum" AS ENUM('active', 'inactive', 'published', 'draft', 'archived')`);
        await queryRunner.query(`ALTER TABLE "training_topics" ALTER COLUMN "topic_status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "training_topics" ALTER COLUMN "topic_status" TYPE "public"."training_topics_topic_status_enum" USING "topic_status"::"text"::"public"."training_topics_topic_status_enum"`);
        await queryRunner.query(`ALTER TABLE "training_topics" ALTER COLUMN "topic_status" SET DEFAULT 'active'`);
        await queryRunner.query(`DROP TYPE "public"."training_topics_topic_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."training_topics_topic_status_enum_old" AS ENUM('active', 'inactive')`);
        await queryRunner.query(`ALTER TABLE "training_topics" ALTER COLUMN "topic_status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "training_topics" ALTER COLUMN "topic_status" TYPE "public"."training_topics_topic_status_enum_old" USING "topic_status"::"text"::"public"."training_topics_topic_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "training_topics" ALTER COLUMN "topic_status" SET DEFAULT 'active'`);
        await queryRunner.query(`DROP TYPE "public"."training_topics_topic_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."training_topics_topic_status_enum_old" RENAME TO "training_topics_topic_status_enum"`);
    }

}
