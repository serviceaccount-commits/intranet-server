"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1752597177945 = void 0;
class Migration1752597177945 {
    name = 'Migration1752597177945';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TYPE "public"."training_topics_topic_status_enum" RENAME TO "training_topics_topic_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."training_topics_topic_status_enum" AS ENUM('active', 'inactive', 'published', 'draft', 'archived')`);
        await queryRunner.query(`ALTER TABLE "training_topics" ALTER COLUMN "topic_status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "training_topics" ALTER COLUMN "topic_status" TYPE "public"."training_topics_topic_status_enum" USING "topic_status"::"text"::"public"."training_topics_topic_status_enum"`);
        await queryRunner.query(`ALTER TABLE "training_topics" ALTER COLUMN "topic_status" SET DEFAULT 'active'`);
        await queryRunner.query(`DROP TYPE "public"."training_topics_topic_status_enum_old"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."training_topics_topic_status_enum_old" AS ENUM('active', 'inactive')`);
        await queryRunner.query(`ALTER TABLE "training_topics" ALTER COLUMN "topic_status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "training_topics" ALTER COLUMN "topic_status" TYPE "public"."training_topics_topic_status_enum_old" USING "topic_status"::"text"::"public"."training_topics_topic_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "training_topics" ALTER COLUMN "topic_status" SET DEFAULT 'active'`);
        await queryRunner.query(`DROP TYPE "public"."training_topics_topic_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."training_topics_topic_status_enum_old" RENAME TO "training_topics_topic_status_enum"`);
    }
}
exports.Migration1752597177945 = Migration1752597177945;
//# sourceMappingURL=1752597177945-migration.js.map