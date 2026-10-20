"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1792454400000 = void 0;
// Folder deletion and per-folder staff access in the KB.
//
// - `topics.deleted_at`: deleting a folder from the intranet is a soft delete.
//   Its articles are archived, and restoring one of them brings the folder
//   chain back, so nothing becomes unreachable.
// - `topic_user_access`: optional restriction. A folder with no rows keeps
//   today's behaviour (whoever has access to the client sees it); once it has
//   rows, only those staff members see it and everything inside it.
class Migration1792454400000 {
    name = 'Migration1792454400000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "topics" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`CREATE TABLE "topic_user_access" (
        "topic_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_topic_user_access" PRIMARY KEY ("topic_id", "user_id"),
        CONSTRAINT "FK_topic_user_access_topic" FOREIGN KEY ("topic_id")
          REFERENCES "topics"("topic_id") ON DELETE CASCADE,
        CONSTRAINT "FK_topic_user_access_user" FOREIGN KEY ("user_id")
          REFERENCES "users"("user_id") ON DELETE CASCADE
      )`);
        await queryRunner.query(`CREATE INDEX "IDX_topic_user_access_user" ON "topic_user_access" ("user_id")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "public"."IDX_topic_user_access_user"`);
        await queryRunner.query(`DROP TABLE "topic_user_access"`);
        await queryRunner.query(`ALTER TABLE "topics" DROP COLUMN "deleted_at"`);
    }
}
exports.Migration1792454400000 = Migration1792454400000;
//# sourceMappingURL=1792454400000-migration.js.map