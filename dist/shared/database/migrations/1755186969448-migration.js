"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1755186969448 = void 0;
class Migration1755186969448 {
    name = 'Migration1755186969448';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "options" DROP CONSTRAINT "FK_2bdd03245b8cb040130fe16f21d"`);
        await queryRunner.query(`ALTER TABLE "options" ADD CONSTRAINT "FK_2bdd03245b8cb040130fe16f21d" FOREIGN KEY ("question_id") REFERENCES "questions"("question_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "options" DROP CONSTRAINT "FK_2bdd03245b8cb040130fe16f21d"`);
        await queryRunner.query(`ALTER TABLE "options" ADD CONSTRAINT "FK_2bdd03245b8cb040130fe16f21d" FOREIGN KEY ("question_id") REFERENCES "questions"("question_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
}
exports.Migration1755186969448 = Migration1755186969448;
//# sourceMappingURL=1755186969448-migration.js.map