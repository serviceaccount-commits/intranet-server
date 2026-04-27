"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1742914379548 = void 0;
class Migration1742914379548 {
    name = 'Migration1742914379548';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "tags" RENAME COLUMN "name" TO "tag_name"`);
        await queryRunner.query(`ALTER TABLE "tags" RENAME CONSTRAINT "UQ_d90243459a697eadb8ad56e9092" TO "UQ_2df8d47c78b4eee8ed46c729f58"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "tags" RENAME CONSTRAINT "UQ_2df8d47c78b4eee8ed46c729f58" TO "UQ_d90243459a697eadb8ad56e9092"`);
        await queryRunner.query(`ALTER TABLE "tags" RENAME COLUMN "tag_name" TO "name"`);
    }
}
exports.Migration1742914379548 = Migration1742914379548;
//# sourceMappingURL=1742914379548-migration.js.map