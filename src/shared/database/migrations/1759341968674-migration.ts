import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1759341968674 implements MigrationInterface {
  name = 'Migration1759341968674';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_17022daf3f885f7d35423e9971e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" DROP CONSTRAINT "PK_1717db2235a5b169822e7f753b1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" DROP COLUMN "permission_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD "permission_id" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD CONSTRAINT "PK_1717db2235a5b169822e7f753b1" PRIMARY KEY ("permission_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "PK_25d24010f53bb80b78e412c9656"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "PK_178199805b901ccd220ab7740ec" PRIMARY KEY ("role_id")`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_17022daf3f885f7d35423e9971"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP COLUMN "permission_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD "permission_id" character varying NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "PK_178199805b901ccd220ab7740ec"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "PK_25d24010f53bb80b78e412c9656" PRIMARY KEY ("role_id", "permission_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_17022daf3f885f7d35423e9971" ON "role_permissions" ("permission_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_17022daf3f885f7d35423e9971e" FOREIGN KEY ("permission_id") REFERENCES "permissions"("permission_id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "FK_17022daf3f885f7d35423e9971e"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_17022daf3f885f7d35423e9971"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "PK_25d24010f53bb80b78e412c9656"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "PK_178199805b901ccd220ab7740ec" PRIMARY KEY ("role_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP COLUMN "permission_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD "permission_id" integer NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_17022daf3f885f7d35423e9971" ON "role_permissions" ("permission_id") `,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" DROP CONSTRAINT "PK_178199805b901ccd220ab7740ec"`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "PK_25d24010f53bb80b78e412c9656" PRIMARY KEY ("role_id", "permission_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" DROP CONSTRAINT "PK_1717db2235a5b169822e7f753b1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" DROP COLUMN "permission_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD "permission_id" integer NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "permissions" ADD CONSTRAINT "PK_1717db2235a5b169822e7f753b1" PRIMARY KEY ("permission_id")`,
    );
    await queryRunner.query(
      `ALTER TABLE "role_permissions" ADD CONSTRAINT "FK_17022daf3f885f7d35423e9971e" FOREIGN KEY ("permission_id") REFERENCES "permissions"("permission_id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }
}
