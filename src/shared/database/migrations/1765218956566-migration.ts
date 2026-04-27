import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1765218956566 implements MigrationInterface {
  name = 'Migration1765218956566';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "questions" DROP CONSTRAINT "FK_f912d2c24bc84f66e0a40b1c169"`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" ADD CONSTRAINT "FK_f912d2c24bc84f66e0a40b1c169" FOREIGN KEY ("exam_id") REFERENCES "exams"("exam_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "questions" DROP CONSTRAINT "FK_f912d2c24bc84f66e0a40b1c169"`,
    );
    await queryRunner.query(
      `ALTER TABLE "questions" ADD CONSTRAINT "FK_f912d2c24bc84f66e0a40b1c169" FOREIGN KEY ("exam_id") REFERENCES "exams"("exam_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
