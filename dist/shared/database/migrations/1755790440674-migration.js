"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1755790440674 = void 0;
class Migration1755790440674 {
    name = 'Migration1755790440674';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_exam_attempts" DROP CONSTRAINT "FK_759852fc6034aa2a708a1334cef"`);
        await queryRunner.query(`ALTER TABLE "user_exam_attempts" DROP CONSTRAINT "REL_759852fc6034aa2a708a1334ce"`);
        await queryRunner.query(`ALTER TABLE "user_exam_attempts" ADD CONSTRAINT "FK_759852fc6034aa2a708a1334cef" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "user_exam_attempts" DROP CONSTRAINT "FK_759852fc6034aa2a708a1334cef"`);
        await queryRunner.query(`ALTER TABLE "user_exam_attempts" ADD CONSTRAINT "REL_759852fc6034aa2a708a1334ce" UNIQUE ("user_id")`);
        await queryRunner.query(`ALTER TABLE "user_exam_attempts" ADD CONSTRAINT "FK_759852fc6034aa2a708a1334cef" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
}
exports.Migration1755790440674 = Migration1755790440674;
//# sourceMappingURL=1755790440674-migration.js.map