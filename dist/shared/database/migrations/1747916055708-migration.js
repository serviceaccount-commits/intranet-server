"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1747916055708 = void 0;
class Migration1747916055708 {
    name = 'Migration1747916055708';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "announcements" DROP COLUMN "open_acknowledge_until"`);
        await queryRunner.query(`ALTER TABLE "announcements" ADD "open_acknowledge_until" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "announcements" DROP COLUMN "open_acknowledge_until"`);
        await queryRunner.query(`ALTER TABLE "announcements" ADD "open_acknowledge_until" TIME WITH TIME ZONE NOT NULL DEFAULT now()`);
    }
}
exports.Migration1747916055708 = Migration1747916055708;
//# sourceMappingURL=1747916055708-migration.js.map