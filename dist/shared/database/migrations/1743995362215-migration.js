"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1743995362215 = void 0;
class Migration1743995362215 {
    name = 'Migration1743995362215';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "training_topics" DROP COLUMN "topic_description"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "training_topics" ADD "topic_description" character varying NOT NULL`);
    }
}
exports.Migration1743995362215 = Migration1743995362215;
//# sourceMappingURL=1743995362215-migration.js.map