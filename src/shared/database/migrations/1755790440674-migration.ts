import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1755790440674 implements MigrationInterface {
    name = 'Migration1755790440674'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_exam_attempts" DROP CONSTRAINT "FK_759852fc6034aa2a708a1334cef"`);
        await queryRunner.query(`ALTER TABLE "user_exam_attempts" DROP CONSTRAINT "REL_759852fc6034aa2a708a1334ce"`);
        await queryRunner.query(`ALTER TABLE "user_exam_attempts" ADD CONSTRAINT "FK_759852fc6034aa2a708a1334cef" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_exam_attempts" DROP CONSTRAINT "FK_759852fc6034aa2a708a1334cef"`);
        await queryRunner.query(`ALTER TABLE "user_exam_attempts" ADD CONSTRAINT "REL_759852fc6034aa2a708a1334ce" UNIQUE ("user_id")`);
        await queryRunner.query(`ALTER TABLE "user_exam_attempts" ADD CONSTRAINT "FK_759852fc6034aa2a708a1334cef" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
