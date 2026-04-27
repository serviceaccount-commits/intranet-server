import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1754423157827 implements MigrationInterface {
  name = 'Migration1754423157827';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_exam_attempts_status_enum" AS ENUM('passed', 'failed')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user_exam_attempts" ADD "status" "public"."user_exam_attempts_status_enum" NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_exam_attempts" DROP COLUMN "status"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."user_exam_attempts_status_enum"`,
    );
  }
}
