import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migration1779393473466 implements MigrationInterface {
  name = 'Migration1779393473466';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "topics" ADD "parent_topic_id" uuid`,
    );
    await queryRunner.query(
      `ALTER TABLE "topics" ADD CONSTRAINT "FK_topics_parent_topic_id" ` +
        `FOREIGN KEY ("parent_topic_id") REFERENCES "topics"("topic_id") ` +
        `ON DELETE SET NULL ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_topics_parent_topic_id" ON "topics" ("parent_topic_id")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_topics_parent_topic_id"`);
    await queryRunner.query(
      `ALTER TABLE "topics" DROP CONSTRAINT "FK_topics_parent_topic_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "topics" DROP COLUMN "parent_topic_id"`,
    );
  }
}
