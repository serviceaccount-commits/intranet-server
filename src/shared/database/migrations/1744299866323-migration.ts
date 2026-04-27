import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1744299866323 implements MigrationInterface {
    name = 'Migration1744299866323'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "class_user_values" DROP CONSTRAINT "FK_0431ac055586144044901eafe21"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0431ac055586144044901eafe2"`);
        await queryRunner.query(`ALTER TABLE "class_user_values" DROP CONSTRAINT "REL_0431ac055586144044901eafe2"`);
        await queryRunner.query(`ALTER TABLE "class_user_values" DROP COLUMN "document_id"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "class_user_values" ADD "document_id" uuid`);
        await queryRunner.query(`ALTER TABLE "class_user_values" ADD CONSTRAINT "REL_0431ac055586144044901eafe2" UNIQUE ("document_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_0431ac055586144044901eafe2" ON "class_user_values" ("document_id") `);
        await queryRunner.query(`ALTER TABLE "class_user_values" ADD CONSTRAINT "FK_0431ac055586144044901eafe21" FOREIGN KEY ("document_id") REFERENCES "documents"("document_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
