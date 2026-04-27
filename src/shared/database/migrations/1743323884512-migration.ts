import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1743323884512 implements MigrationInterface {
    name = 'Migration1743323884512'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "classes" ADD "user_id" uuid`);
        await queryRunner.query(`CREATE INDEX "IDX_955ac25b387802b256a3e35aa9" ON "classes" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "classes" ADD CONSTRAINT "FK_955ac25b387802b256a3e35aa95" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "classes" DROP CONSTRAINT "FK_955ac25b387802b256a3e35aa95"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_955ac25b387802b256a3e35aa9"`);
        await queryRunner.query(`ALTER TABLE "classes" DROP COLUMN "user_id"`);
    }

}
