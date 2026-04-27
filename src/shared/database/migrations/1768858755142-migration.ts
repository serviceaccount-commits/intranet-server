import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1768858755142 implements MigrationInterface {
  name = 'Migration1768858755142';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_user_values" DROP CONSTRAINT "FK_de379c23ed275b459c79c7199bb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_user_values" DROP CONSTRAINT "FK_12380719382ecebd03b58d99429"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_user_values" ADD CONSTRAINT "FK_12380719382ecebd03b58d99429" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_user_values" ADD CONSTRAINT "FK_de379c23ed275b459c79c7199bb" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "course_user_values" DROP CONSTRAINT "FK_de379c23ed275b459c79c7199bb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_user_values" DROP CONSTRAINT "FK_12380719382ecebd03b58d99429"`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_user_values" ADD CONSTRAINT "FK_12380719382ecebd03b58d99429" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "course_user_values" ADD CONSTRAINT "FK_de379c23ed275b459c79c7199bb" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }
}
