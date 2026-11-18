import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Several roles per person: `user_additional_roles` holds the roles on top of
 * the main one (users.role_id). Adds `roles:assign`, the only permission that
 * lets someone give or take roles from people.
 */
export class Migration1792713600000 implements MigrationInterface {
  name = 'Migration1792713600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "user_additional_roles" (
         "user_id" uuid NOT NULL,
         "role_id" uuid NOT NULL,
         CONSTRAINT "PK_user_additional_roles" PRIMARY KEY ("user_id", "role_id"),
         CONSTRAINT "FK_user_additional_roles_user" FOREIGN KEY ("user_id")
           REFERENCES "users"("user_id") ON DELETE CASCADE ON UPDATE CASCADE,
         CONSTRAINT "FK_user_additional_roles_role" FOREIGN KEY ("role_id")
           REFERENCES "roles"("role_id") ON DELETE CASCADE ON UPDATE CASCADE
       )`,
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_user_additional_roles_role" ON "user_additional_roles" ("role_id")`,
    );
    await queryRunner.query(
      `INSERT INTO "permissions" ("permission_id", "app_module") VALUES ('roles:assign', 'admin')
       ON CONFLICT DO NOTHING`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "role_permissions" WHERE "permission_id" = 'roles:assign'`);
    await queryRunner.query(`DELETE FROM "permissions" WHERE "permission_id" = 'roles:assign'`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user_additional_roles"`);
  }
}
