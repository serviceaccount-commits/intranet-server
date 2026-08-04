"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1785801600000 = void 0;
// Onboarding tour completion flag. NULL = the user has not completed
// (or dismissed) the onboarding tour yet, so every existing user sees
// the welcome dialog once on their next login.
class Migration1785801600000 {
    name = 'Migration1785801600000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" ADD "onboarding_completed_at" TIMESTAMP WITH TIME ZONE`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "onboarding_completed_at"`);
    }
}
exports.Migration1785801600000 = Migration1785801600000;
//# sourceMappingURL=1785801600000-migration.js.map