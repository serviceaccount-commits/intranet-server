import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1755186969448 implements MigrationInterface {
    name = 'Migration1755186969448'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "options" DROP CONSTRAINT "FK_2bdd03245b8cb040130fe16f21d"`);
        await queryRunner.query(`ALTER TABLE "options" ADD CONSTRAINT "FK_2bdd03245b8cb040130fe16f21d" FOREIGN KEY ("question_id") REFERENCES "questions"("question_id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "options" DROP CONSTRAINT "FK_2bdd03245b8cb040130fe16f21d"`);
        await queryRunner.query(`ALTER TABLE "options" ADD CONSTRAINT "FK_2bdd03245b8cb040130fe16f21d" FOREIGN KEY ("question_id") REFERENCES "questions"("question_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
