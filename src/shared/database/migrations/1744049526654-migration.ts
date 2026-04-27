import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1744049526654 implements MigrationInterface {
    name = 'Migration1744049526654'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."course_user_values_user_availability_status_enum" AS ENUM('active', 'inactive')`);
        await queryRunner.query(`CREATE TABLE "course_user_values" ("course_value_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_availability_status" "public"."course_user_values_user_availability_status_enum" NOT NULL DEFAULT 'active', "user_id" uuid, "course_id" uuid, CONSTRAINT "PK_efc522b8423f01650d51cb2b0bb" PRIMARY KEY ("course_value_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_12380719382ecebd03b58d9942" ON "course_user_values" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_de379c23ed275b459c79c7199b" ON "course_user_values" ("course_id") `);
        await queryRunner.query(`CREATE TYPE "public"."class_user_values_completion_status_enum" AS ENUM('completed', 'incomplete')`);
        await queryRunner.query(`CREATE TABLE "class_user_values" ("class_value_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "completion_status" "public"."class_user_values_completion_status_enum" NOT NULL DEFAULT 'incomplete', "user_id" uuid, "topic_value_id" uuid, "topic_id" character varying, "document_id" uuid, "class_id" uuid, CONSTRAINT "REL_0431ac055586144044901eafe2" UNIQUE ("document_id"), CONSTRAINT "PK_7ca8e0681e53276843170017d37" PRIMARY KEY ("class_value_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_d81f5d3e14609c6790477023cc" ON "class_user_values" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_adc0057ab8afba142a9a2a48f1" ON "class_user_values" ("topic_value_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_1851572c725c19dcfd82398a3f" ON "class_user_values" ("class_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_0431ac055586144044901eafe2" ON "class_user_values" ("document_id") `);
        await queryRunner.query(`CREATE TABLE "training_topic_user_values" ("topic_value_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid, "course_value_id" uuid, "topic_id" uuid, CONSTRAINT "PK_1e1474fb3baf064c8554844db71" PRIMARY KEY ("topic_value_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f9e403e870bf78ee40b407d4e4" ON "training_topic_user_values" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_53eb0fa37d05180e2ebe32dea7" ON "training_topic_user_values" ("course_value_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_c9bcaccc3d0a71b83842f5d0d4" ON "training_topic_user_values" ("topic_id") `);
        await queryRunner.query(`ALTER TABLE "course_user_values" ADD CONSTRAINT "FK_12380719382ecebd03b58d99429" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course_user_values" ADD CONSTRAINT "FK_de379c23ed275b459c79c7199bb" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "class_user_values" ADD CONSTRAINT "FK_d81f5d3e14609c6790477023ccd" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "class_user_values" ADD CONSTRAINT "FK_adc0057ab8afba142a9a2a48f16" FOREIGN KEY ("topic_value_id") REFERENCES "training_topic_user_values"("topic_value_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "class_user_values" ADD CONSTRAINT "FK_1851572c725c19dcfd82398a3f8" FOREIGN KEY ("class_id") REFERENCES "classes"("class_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "class_user_values" ADD CONSTRAINT "FK_0431ac055586144044901eafe21" FOREIGN KEY ("document_id") REFERENCES "documents"("document_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "training_topic_user_values" ADD CONSTRAINT "FK_f9e403e870bf78ee40b407d4e44" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "training_topic_user_values" ADD CONSTRAINT "FK_53eb0fa37d05180e2ebe32dea70" FOREIGN KEY ("course_value_id") REFERENCES "course_user_values"("course_value_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "training_topic_user_values" ADD CONSTRAINT "FK_c9bcaccc3d0a71b83842f5d0d47" FOREIGN KEY ("topic_id") REFERENCES "training_topics"("topic_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "training_topic_user_values" DROP CONSTRAINT "FK_c9bcaccc3d0a71b83842f5d0d47"`);
        await queryRunner.query(`ALTER TABLE "training_topic_user_values" DROP CONSTRAINT "FK_53eb0fa37d05180e2ebe32dea70"`);
        await queryRunner.query(`ALTER TABLE "training_topic_user_values" DROP CONSTRAINT "FK_f9e403e870bf78ee40b407d4e44"`);
        await queryRunner.query(`ALTER TABLE "class_user_values" DROP CONSTRAINT "FK_0431ac055586144044901eafe21"`);
        await queryRunner.query(`ALTER TABLE "class_user_values" DROP CONSTRAINT "FK_1851572c725c19dcfd82398a3f8"`);
        await queryRunner.query(`ALTER TABLE "class_user_values" DROP CONSTRAINT "FK_adc0057ab8afba142a9a2a48f16"`);
        await queryRunner.query(`ALTER TABLE "class_user_values" DROP CONSTRAINT "FK_d81f5d3e14609c6790477023ccd"`);
        await queryRunner.query(`ALTER TABLE "course_user_values" DROP CONSTRAINT "FK_de379c23ed275b459c79c7199bb"`);
        await queryRunner.query(`ALTER TABLE "course_user_values" DROP CONSTRAINT "FK_12380719382ecebd03b58d99429"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c9bcaccc3d0a71b83842f5d0d4"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_53eb0fa37d05180e2ebe32dea7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f9e403e870bf78ee40b407d4e4"`);
        await queryRunner.query(`DROP TABLE "training_topic_user_values"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0431ac055586144044901eafe2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1851572c725c19dcfd82398a3f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_adc0057ab8afba142a9a2a48f1"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d81f5d3e14609c6790477023cc"`);
        await queryRunner.query(`DROP TABLE "class_user_values"`);
        await queryRunner.query(`DROP TYPE "public"."class_user_values_completion_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_de379c23ed275b459c79c7199b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_12380719382ecebd03b58d9942"`);
        await queryRunner.query(`DROP TABLE "course_user_values"`);
        await queryRunner.query(`DROP TYPE "public"."course_user_values_user_availability_status_enum"`);
    }

}
