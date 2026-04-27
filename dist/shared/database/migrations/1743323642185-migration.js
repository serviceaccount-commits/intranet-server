"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1743323642185 = void 0;
class Migration1743323642185 {
    name = 'Migration1743323642185';
    async up(queryRunner) {
        await queryRunner.query(`CREATE TABLE "courses" ("course_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "course_name" character varying NOT NULL, "course_description" character varying NOT NULL, CONSTRAINT "PK_42dc69837b2e7bc603686ddaf53" PRIMARY KEY ("course_id"))`);
        await queryRunner.query(`CREATE TABLE "classes" ("class_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "class_name" character varying NOT NULL, "class_description" character varying NOT NULL, "topic_id" uuid, CONSTRAINT "PK_1c29abc497051d41c2d6e276a05" PRIMARY KEY ("class_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_283847e1250800b5d7b805c157" ON "classes" ("topic_id") `);
        await queryRunner.query(`CREATE TABLE "training_topics" ("topic_id" uuid NOT NULL DEFAULT uuid_generate_v4(), "topic_name" character varying NOT NULL, "topic_description" character varying NOT NULL, "course_id" uuid, CONSTRAINT "PK_13a5a4b6c8cae275bb27f7dea03" PRIMARY KEY ("topic_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f74a40079f52a15d98b3642d8c" ON "training_topics" ("course_id") `);
        await queryRunner.query(`ALTER TABLE "classes" ADD CONSTRAINT "FK_283847e1250800b5d7b805c157c" FOREIGN KEY ("topic_id") REFERENCES "training_topics"("topic_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "training_topics" ADD CONSTRAINT "FK_f74a40079f52a15d98b3642d8ce" FOREIGN KEY ("course_id") REFERENCES "courses"("course_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "training_topics" DROP CONSTRAINT "FK_f74a40079f52a15d98b3642d8ce"`);
        await queryRunner.query(`ALTER TABLE "classes" DROP CONSTRAINT "FK_283847e1250800b5d7b805c157c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_f74a40079f52a15d98b3642d8c"`);
        await queryRunner.query(`DROP TABLE "training_topics"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_283847e1250800b5d7b805c157"`);
        await queryRunner.query(`DROP TABLE "classes"`);
        await queryRunner.query(`DROP TABLE "courses"`);
    }
}
exports.Migration1743323642185 = Migration1743323642185;
//# sourceMappingURL=1743323642185-migration.js.map