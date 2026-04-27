import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1742914379548 implements MigrationInterface {
    name = 'Migration1742914379548'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tags" RENAME COLUMN "name" TO "tag_name"`);
        await queryRunner.query(`ALTER TABLE "tags" RENAME CONSTRAINT "UQ_d90243459a697eadb8ad56e9092" TO "UQ_2df8d47c78b4eee8ed46c729f58"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "tags" RENAME CONSTRAINT "UQ_2df8d47c78b4eee8ed46c729f58" TO "UQ_d90243459a697eadb8ad56e9092"`);
        await queryRunner.query(`ALTER TABLE "tags" RENAME COLUMN "tag_name" TO "name"`);
    }

}
