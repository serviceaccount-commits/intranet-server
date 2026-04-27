"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1744219025974 = void 0;
class Migration1744219025974 {
    name = 'Migration1744219025974';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."courses_course_status_enum" AS ENUM('active', 'inactive')`);
        await queryRunner.query(`ALTER TABLE "courses" ADD "course_status" "public"."courses_course_status_enum" NOT NULL DEFAULT 'active'`);
        await queryRunner.query(`CREATE TYPE "public"."training_topics_topic_status_enum" AS ENUM('active', 'inactive')`);
        await queryRunner.query(`ALTER TABLE "training_topics" ADD "topic_status" "public"."training_topics_topic_status_enum" NOT NULL DEFAULT 'active'`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "training_topics" DROP COLUMN "topic_status"`);
        await queryRunner.query(`DROP TYPE "public"."training_topics_topic_status_enum"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "course_status"`);
        await queryRunner.query(`DROP TYPE "public"."courses_course_status_enum"`);
    }
}
exports.Migration1744219025974 = Migration1744219025974;
//# sourceMappingURL=1744219025974-migration.js.map