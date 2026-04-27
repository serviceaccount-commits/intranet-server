"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1752594162717 = void 0;
class Migration1752594162717 {
    name = 'Migration1752594162717';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TYPE "public"."courses_course_status_enum" RENAME TO "courses_course_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."courses_course_status_enum" AS ENUM('active', 'inactive', 'published', 'draft', 'archived')`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "course_status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "course_status" TYPE "public"."courses_course_status_enum" USING "course_status"::"text"::"public"."courses_course_status_enum"`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "course_status" SET DEFAULT 'active'`);
        await queryRunner.query(`DROP TYPE "public"."courses_course_status_enum_old"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."courses_course_status_enum_old" AS ENUM('active', 'inactive')`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "course_status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "course_status" TYPE "public"."courses_course_status_enum_old" USING "course_status"::"text"::"public"."courses_course_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "course_status" SET DEFAULT 'active'`);
        await queryRunner.query(`DROP TYPE "public"."courses_course_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."courses_course_status_enum_old" RENAME TO "courses_course_status_enum"`);
    }
}
exports.Migration1752594162717 = Migration1752594162717;
//# sourceMappingURL=1752594162717-migration.js.map