"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1754163307326 = void 0;
class Migration1754163307326 {
    name = 'Migration1754163307326';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."question_types_type_name_enum" AS ENUM('multiple-selection', 'true-false')`);
        await queryRunner.query(`CREATE TABLE "question_types" ("question_type_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type_name" "public"."question_types_type_name_enum" NOT NULL DEFAULT 'multiple-selection', CONSTRAINT "PK_1b38b00f1c026b836bb533b9d62" PRIMARY KEY ("question_type_id"))`);
        await queryRunner.query(`CREATE TABLE "options" ("option_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "question_id" uuid NOT NULL, "option_text" character varying NOT NULL, "is_correct" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_7817b5daaf3297d3c83cfeb3674" PRIMARY KEY ("option_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_2bdd03245b8cb040130fe16f21" ON "options" ("question_id") `);
        await queryRunner.query(`CREATE TABLE "questions" ("question_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "exam_id" uuid NOT NULL, "question_type_id" uuid NOT NULL, "question_text" character varying NOT NULL, CONSTRAINT "PK_8e940ecc478000e09fa8b008ec6" PRIMARY KEY ("question_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f912d2c24bc84f66e0a40b1c16" ON "questions" ("exam_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_833c9f88f4b33c2557c5f0aa4c" ON "questions" ("question_type_id") `);
        await queryRunner.query(`CREATE TABLE "exams" ("exam_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "class_id" uuid, "exam_title" character varying NOT NULL, "passing_score" integer NOT NULL, CONSTRAINT "REL_7fe60823f5f2c03867eafba8fa" UNIQUE ("class_id"), CONSTRAINT "PK_7fa41a3a161c719dbb3bbd67eef" PRIMARY KEY ("exam_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_7fe60823f5f2c03867eafba8fa" ON "exams" ("class_id") `);
        await queryRunner.query(`CREATE TABLE "user_exam_attempts" ("attempt_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "exam_id" uuid NOT NULL, "user_id" uuid NOT NULL, "attempt_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "score" integer NOT NULL DEFAULT '0', CONSTRAINT "REL_759852fc6034aa2a708a1334ce" UNIQUE ("user_id"), CONSTRAINT "PK_b21ba9e434c853c4ecca261da97" PRIMARY KEY ("attempt_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_3d5740a87ae6c72d07a54cfc2f" ON "user_exam_attempts" ("exam_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_759852fc6034aa2a708a1334ce" ON "user_exam_attempts" ("user_id") `);
        await queryRunner.query(`CREATE TABLE "user_answers" ("user_answer_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "attempt_id" uuid NOT NULL, "question_id" uuid NOT NULL, "option_id" uuid NOT NULL, CONSTRAINT "PK_dfcf5fb4f04ced25bd033bdf406" PRIMARY KEY ("user_answer_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_60b3d170e680c0bb8af432cdc7" ON "user_answers" ("attempt_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_adae59e684b873b084be36c5a7" ON "user_answers" ("question_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_d712cea87e9712541cc372f120" ON "user_answers" ("option_id") `);
        await queryRunner.query(`ALTER TABLE "options" ADD CONSTRAINT "FK_2bdd03245b8cb040130fe16f21d" FOREIGN KEY ("question_id") REFERENCES "questions"("question_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "FK_f912d2c24bc84f66e0a40b1c169" FOREIGN KEY ("exam_id") REFERENCES "exams"("exam_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "FK_833c9f88f4b33c2557c5f0aa4c3" FOREIGN KEY ("question_type_id") REFERENCES "question_types"("question_type_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "exams" ADD CONSTRAINT "FK_7fe60823f5f2c03867eafba8fa9" FOREIGN KEY ("class_id") REFERENCES "classes"("class_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_exam_attempts" ADD CONSTRAINT "FK_3d5740a87ae6c72d07a54cfc2ff" FOREIGN KEY ("exam_id") REFERENCES "exams"("exam_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_exam_attempts" ADD CONSTRAINT "FK_759852fc6034aa2a708a1334cef" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_answers" ADD CONSTRAINT "FK_60b3d170e680c0bb8af432cdc7d" FOREIGN KEY ("attempt_id") REFERENCES "user_exam_attempts"("attempt_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_answers" ADD CONSTRAINT "FK_adae59e684b873b084be36c5a7a" FOREIGN KEY ("question_id") REFERENCES "questions"("question_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_answers" ADD CONSTRAINT "FK_d712cea87e9712541cc372f120a" FOREIGN KEY ("option_id") REFERENCES "options"("option_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_answers" DROP CONSTRAINT "FK_d712cea87e9712541cc372f120a"`);
        await queryRunner.query(`ALTER TABLE "user_answers" DROP CONSTRAINT "FK_adae59e684b873b084be36c5a7a"`);
        await queryRunner.query(`ALTER TABLE "user_answers" DROP CONSTRAINT "FK_60b3d170e680c0bb8af432cdc7d"`);
        await queryRunner.query(`ALTER TABLE "user_exam_attempts" DROP CONSTRAINT "FK_759852fc6034aa2a708a1334cef"`);
        await queryRunner.query(`ALTER TABLE "user_exam_attempts" DROP CONSTRAINT "FK_3d5740a87ae6c72d07a54cfc2ff"`);
        await queryRunner.query(`ALTER TABLE "exams" DROP CONSTRAINT "FK_7fe60823f5f2c03867eafba8fa9"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "FK_833c9f88f4b33c2557c5f0aa4c3"`);
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "FK_f912d2c24bc84f66e0a40b1c169"`);
        await queryRunner.query(`ALTER TABLE "options" DROP CONSTRAINT "FK_2bdd03245b8cb040130fe16f21d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d712cea87e9712541cc372f120"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_adae59e684b873b084be36c5a7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_60b3d170e680c0bb8af432cdc7"`);
        await queryRunner.query(`DROP TABLE "user_answers"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_759852fc6034aa2a708a1334ce"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3d5740a87ae6c72d07a54cfc2f"`);
        await queryRunner.query(`DROP TABLE "user_exam_attempts"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7fe60823f5f2c03867eafba8fa"`);
        await queryRunner.query(`DROP TABLE "exams"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_833c9f88f4b33c2557c5f0aa4c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f912d2c24bc84f66e0a40b1c16"`);
        await queryRunner.query(`DROP TABLE "questions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2bdd03245b8cb040130fe16f21"`);
        await queryRunner.query(`DROP TABLE "options"`);
        await queryRunner.query(`DROP TABLE "question_types"`);
        await queryRunner.query(`DROP TYPE "public"."question_types_type_name_enum"`);
    }
}
exports.Migration1754163307326 = Migration1754163307326;
//# sourceMappingURL=1754163307326-migration.js.map