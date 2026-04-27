"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1754423157827 = void 0;
class Migration1754423157827 {
    name = 'Migration1754423157827';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TYPE "public"."user_exam_attempts_status_enum" AS ENUM('passed', 'failed')`);
        await queryRunner.query(`ALTER TABLE "user_exam_attempts" ADD "status" "public"."user_exam_attempts_status_enum" NOT NULL`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_exam_attempts" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."user_exam_attempts_status_enum"`);
    }
}
exports.Migration1754423157827 = Migration1754423157827;
//# sourceMappingURL=1754423157827-migration.js.map