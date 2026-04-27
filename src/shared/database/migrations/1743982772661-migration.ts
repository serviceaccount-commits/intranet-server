import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1743982772661 implements MigrationInterface {
    name = 'Migration1743982772661'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" ADD "user_id" uuid`);
        await queryRunner.query(`CREATE INDEX "IDX_a4396a5235f159ab156a6f8b60" ON "courses" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "courses" ADD CONSTRAINT "FK_a4396a5235f159ab156a6f8b603" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" DROP CONSTRAINT "FK_a4396a5235f159ab156a6f8b603"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a4396a5235f159ab156a6f8b60"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "user_id"`);
    }

}
