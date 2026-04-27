import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1753202513457 implements MigrationInterface {
    name = 'Migration1753202513457'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "article_edit_available"`);
        await queryRunner.query(`ALTER TABLE "articles" ADD "lockedByUserId" character varying`);
        await queryRunner.query(`ALTER TABLE "articles" ADD "lockExpiresAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "lockExpiresAt"`);
        await queryRunner.query(`ALTER TABLE "articles" DROP COLUMN "lockedByUserId"`);
        await queryRunner.query(`ALTER TABLE "articles" ADD "article_edit_available" boolean NOT NULL DEFAULT true`);
    }

}
