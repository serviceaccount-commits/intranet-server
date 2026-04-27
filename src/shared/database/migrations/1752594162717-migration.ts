import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1752594162717 implements MigrationInterface {
    name = 'Migration1752594162717'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."courses_course_status_enum" RENAME TO "courses_course_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."courses_course_status_enum" AS ENUM('active', 'inactive', 'published', 'draft', 'archived')`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "course_status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "course_status" TYPE "public"."courses_course_status_enum" USING "course_status"::"text"::"public"."courses_course_status_enum"`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "course_status" SET DEFAULT 'active'`);
        await queryRunner.query(`DROP TYPE "public"."courses_course_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."courses_course_status_enum_old" AS ENUM('active', 'inactive')`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "course_status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "course_status" TYPE "public"."courses_course_status_enum_old" USING "course_status"::"text"::"public"."courses_course_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "course_status" SET DEFAULT 'active'`);
        await queryRunner.query(`DROP TYPE "public"."courses_course_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."courses_course_status_enum_old" RENAME TO "courses_course_status_enum"`);
    }

}
