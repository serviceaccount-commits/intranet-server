"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1765218500506 = void 0;
class Migration1765218500506 {
    name = 'Migration1765218500506';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."standalone_exams_standalone_exam_status_enum" AS ENUM('awaiting-approval', 'approved', 'in-progress')`);
        await queryRunner.query(`CREATE TABLE "standalone_exams" ("standalone_exam_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "standalone_exam_name" character varying NOT NULL, "standalone_exam_status" "public"."standalone_exams_standalone_exam_status_enum" NOT NULL DEFAULT 'in-progress', "user_id" uuid, "approved_by_id" uuid, "exam_id" uuid, CONSTRAINT "REL_c51da06d2fe6c4de6396882227" UNIQUE ("exam_id"), CONSTRAINT "PK_ef16620c4af099d8cfd1f29f240" PRIMARY KEY ("standalone_exam_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_071045f0d988711c2b1e55d311" ON "standalone_exams" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_7d58e45fe2302d83f91fc52f4e" ON "standalone_exams" ("approved_by_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_c51da06d2fe6c4de6396882227" ON "standalone_exams" ("exam_id") `);
        await queryRunner.query(`ALTER TABLE "exams" ADD "standalone_exam_id" uuid`);
        await queryRunner.query(`ALTER TABLE "exams" ADD CONSTRAINT "UQ_49350818422a7b4cf62f3ecb582" UNIQUE ("standalone_exam_id")`);
        await queryRunner.query(`CREATE TYPE "public"."exams_exam_type_enum" AS ENUM('class-exam', 'standalone-exam')`);
        await queryRunner.query(`ALTER TABLE "exams" ADD "exam_type" "public"."exams_exam_type_enum" NOT NULL DEFAULT 'class-exam'`);
        await queryRunner.query(`CREATE INDEX "IDX_49350818422a7b4cf62f3ecb58" ON "exams" ("standalone_exam_id") `);
        await queryRunner.query(`ALTER TABLE "standalone_exams" ADD CONSTRAINT "FK_071045f0d988711c2b1e55d3117" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "standalone_exams" ADD CONSTRAINT "FK_7d58e45fe2302d83f91fc52f4e8" FOREIGN KEY ("approved_by_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "standalone_exams" ADD CONSTRAINT "FK_c51da06d2fe6c4de63968822275" FOREIGN KEY ("exam_id") REFERENCES "exams"("exam_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "exams" ADD CONSTRAINT "FK_49350818422a7b4cf62f3ecb582" FOREIGN KEY ("standalone_exam_id") REFERENCES "standalone_exams"("standalone_exam_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "exams" DROP CONSTRAINT "FK_49350818422a7b4cf62f3ecb582"`);
        await queryRunner.query(`ALTER TABLE "standalone_exams" DROP CONSTRAINT "FK_c51da06d2fe6c4de63968822275"`);
        await queryRunner.query(`ALTER TABLE "standalone_exams" DROP CONSTRAINT "FK_7d58e45fe2302d83f91fc52f4e8"`);
        await queryRunner.query(`ALTER TABLE "standalone_exams" DROP CONSTRAINT "FK_071045f0d988711c2b1e55d3117"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_49350818422a7b4cf62f3ecb58"`);
        await queryRunner.query(`ALTER TABLE "exams" DROP COLUMN "exam_type"`);
        await queryRunner.query(`DROP TYPE "public"."exams_exam_type_enum"`);
        await queryRunner.query(`ALTER TABLE "exams" DROP CONSTRAINT "UQ_49350818422a7b4cf62f3ecb582"`);
        await queryRunner.query(`ALTER TABLE "exams" DROP COLUMN "standalone_exam_id"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c51da06d2fe6c4de6396882227"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7d58e45fe2302d83f91fc52f4e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_071045f0d988711c2b1e55d311"`);
        await queryRunner.query(`DROP TABLE "standalone_exams"`);
        await queryRunner.query(`DROP TYPE "public"."standalone_exams_standalone_exam_status_enum"`);
    }
}
exports.Migration1765218500506 = Migration1765218500506;
//# sourceMappingURL=1765218500506-migration.js.map