"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1765218956566 = void 0;
class Migration1765218956566 {
    name = 'Migration1765218956566';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "FK_f912d2c24bc84f66e0a40b1c169"`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "FK_f912d2c24bc84f66e0a40b1c169" FOREIGN KEY ("exam_id") REFERENCES "exams"("exam_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "questions" DROP CONSTRAINT "FK_f912d2c24bc84f66e0a40b1c169"`);
        await queryRunner.query(`ALTER TABLE "questions" ADD CONSTRAINT "FK_f912d2c24bc84f66e0a40b1c169" FOREIGN KEY ("exam_id") REFERENCES "exams"("exam_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
}
exports.Migration1765218956566 = Migration1765218956566;
//# sourceMappingURL=1765218956566-migration.js.map