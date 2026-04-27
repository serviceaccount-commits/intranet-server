import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1744131288349 implements MigrationInterface {
    name = 'Migration1744131288349'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."comments_comment_status_enum" AS ENUM('active', 'inactive')`);
        await queryRunner.query(`CREATE TABLE "comments" ("comment_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "comment_content" character varying NOT NULL, "comment_status" "public"."comments_comment_status_enum" NOT NULL DEFAULT 'active', "user_id" uuid, "class_id" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_eb0d76f2ca45d66a7de04c7c72b" PRIMARY KEY ("comment_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_4c675567d2a58f0b07cef09c13" ON "comments" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_06449052cb642a04cb0ddd4a73" ON "comments" ("class_id") `);
        await queryRunner.query(`CREATE TYPE "public"."classes_class_status_enum" AS ENUM('published', 'draft', 'archived')`);
        await queryRunner.query(`ALTER TABLE "classes" ADD "class_status" "public"."classes_class_status_enum" NOT NULL DEFAULT 'draft'`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_4c675567d2a58f0b07cef09c13d" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_06449052cb642a04cb0ddd4a736" FOREIGN KEY ("class_id") REFERENCES "classes"("class_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_06449052cb642a04cb0ddd4a736"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_4c675567d2a58f0b07cef09c13d"`);
        await queryRunner.query(`ALTER TABLE "classes" DROP COLUMN "class_status"`);
        await queryRunner.query(`DROP TYPE "public"."classes_class_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_06449052cb642a04cb0ddd4a73"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4c675567d2a58f0b07cef09c13"`);
        await queryRunner.query(`DROP TABLE "comments"`);
        await queryRunner.query(`DROP TYPE "public"."comments_comment_status_enum"`);
    }

}
