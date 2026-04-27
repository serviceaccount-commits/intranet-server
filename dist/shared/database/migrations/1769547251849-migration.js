"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1769547251849 = void 0;
class Migration1769547251849 {
    name = 'Migration1769547251849';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "last_activity_at" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "last_activity_at" DROP DEFAULT`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "last_activity_at" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "last_activity_at" SET NOT NULL`);
    }
}
exports.Migration1769547251849 = Migration1769547251849;
//# sourceMappingURL=1769547251849-migration.js.map