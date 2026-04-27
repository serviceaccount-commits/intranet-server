"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1744194584932 = void 0;
class Migration1744194584932 {
    name = 'Migration1744194584932';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "class_user_values" DROP COLUMN "topic_id"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "class_user_values" ADD "topic_id" character varying`);
    }
}
exports.Migration1744194584932 = Migration1744194584932;
//# sourceMappingURL=1744194584932-migration.js.map