import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1754518482080 implements MigrationInterface {
    name = 'Migration1754518482080'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "topics" DROP CONSTRAINT "FK_55f03ccaeee22a418c4b00b83a2"`);
        await queryRunner.query(`ALTER TABLE "topics" RENAME COLUMN "category_id" TO "client_id"`);
        await queryRunner.query(`ALTER TABLE "topics" ADD CONSTRAINT "FK_a732c0bd94d23273cc8f60b8709" FOREIGN KEY ("client_id") REFERENCES "clients"("client_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "topics" DROP CONSTRAINT "FK_a732c0bd94d23273cc8f60b8709"`);
        await queryRunner.query(`ALTER TABLE "topics" RENAME COLUMN "client_id" TO "category_id"`);
        await queryRunner.query(`ALTER TABLE "topics" ADD CONSTRAINT "FK_55f03ccaeee22a418c4b00b83a2" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
