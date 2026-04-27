import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1754249624319 implements MigrationInterface {
    name = 'Migration1754249624319'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exams" ADD "version" integer NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."exams_exam_status_enum" AS ENUM('published', 'draft', 'outdated')`);
        await queryRunner.query(`ALTER TABLE "exams" ADD "exam_status" "public"."exams_exam_status_enum" NOT NULL DEFAULT 'draft'`);
        await queryRunner.query(`ALTER TABLE "user_exam_attempts" ADD "isValid" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "exams" DROP CONSTRAINT "FK_7fe60823f5f2c03867eafba8fa9"`);
        await queryRunner.query(`ALTER TABLE "exams" DROP CONSTRAINT "REL_7fe60823f5f2c03867eafba8fa"`);
        await queryRunner.query(`ALTER TABLE "exams" ADD CONSTRAINT "FK_7fe60823f5f2c03867eafba8fa9" FOREIGN KEY ("class_id") REFERENCES "classes"("class_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "exams" DROP CONSTRAINT "FK_7fe60823f5f2c03867eafba8fa9"`);
        await queryRunner.query(`ALTER TABLE "exams" ADD CONSTRAINT "REL_7fe60823f5f2c03867eafba8fa" UNIQUE ("class_id")`);
        await queryRunner.query(`ALTER TABLE "exams" ADD CONSTRAINT "FK_7fe60823f5f2c03867eafba8fa9" FOREIGN KEY ("class_id") REFERENCES "classes"("class_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_exam_attempts" DROP COLUMN "isValid"`);
        await queryRunner.query(`ALTER TABLE "exams" DROP COLUMN "exam_status"`);
        await queryRunner.query(`DROP TYPE "public"."exams_exam_status_enum"`);
        await queryRunner.query(`ALTER TABLE "exams" DROP COLUMN "version"`);
    }

}
