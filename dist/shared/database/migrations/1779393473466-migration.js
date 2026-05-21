"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1779393473466 = void 0;
class Migration1779393473466 {
    name = 'Migration1779393473466';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "topics" ADD "parent_topic_id" uuid`);
        await queryRunner.query(`ALTER TABLE "topics" ADD CONSTRAINT "FK_topics_parent_topic_id" ` +
            `FOREIGN KEY ("parent_topic_id") REFERENCES "topics"("topic_id") ` +
            `ON DELETE SET NULL ON UPDATE CASCADE`);
        await queryRunner.query(`CREATE INDEX "IDX_topics_parent_topic_id" ON "topics" ("parent_topic_id")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "IDX_topics_parent_topic_id"`);
        await queryRunner.query(`ALTER TABLE "topics" DROP CONSTRAINT "FK_topics_parent_topic_id"`);
        await queryRunner.query(`ALTER TABLE "topics" DROP COLUMN "parent_topic_id"`);
    }
}
exports.Migration1779393473466 = Migration1779393473466;
//# sourceMappingURL=1779393473466-migration.js.map