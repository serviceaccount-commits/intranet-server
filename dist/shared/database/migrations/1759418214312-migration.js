"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1759418214312 = void 0;
class Migration1759418214312 {
    name = 'Migration1759418214312';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "roles" ADD "description" character varying`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "roles" DROP COLUMN "description"`);
    }
}
exports.Migration1759418214312 = Migration1759418214312;
//# sourceMappingURL=1759418214312-migration.js.map