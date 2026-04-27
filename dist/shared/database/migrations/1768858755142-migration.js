"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1768858755142 = void 0;
class Migration1768858755142 {
    name = 'Migration1768858755142';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "course_user_values" DROP CONSTRAINT "FK_de379c23ed275b459c79c7199bb"`);
        await queryRunner.query(`ALTER TABLE "course_user_values" DROP CONSTRAINT "FK_12380719382ecebd03b58d99429"`);
        await queryRunner.query(`ALTER TABLE "course_user_values" ADD CONSTRAINT "FK_12380719382ecebd03b58d99429" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course_user_values" ADD CONSTRAINT "FK_de379c23ed275b459c79c7199bb" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "course_user_values" DROP CONSTRAINT "FK_de379c23ed275b459c79c7199bb"`);
        await queryRunner.query(`ALTER TABLE "course_user_values" DROP CONSTRAINT "FK_12380719382ecebd03b58d99429"`);
        await queryRunner.query(`ALTER TABLE "course_user_values" ADD CONSTRAINT "FK_12380719382ecebd03b58d99429" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "course_user_values" ADD CONSTRAINT "FK_de379c23ed275b459c79c7199bb" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
}
exports.Migration1768858755142 = Migration1768858755142;
//# sourceMappingURL=1768858755142-migration.js.map