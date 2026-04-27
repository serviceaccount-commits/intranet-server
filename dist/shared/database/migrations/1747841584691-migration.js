"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1747841584691 = void 0;
class Migration1747841584691 {
    name = 'Migration1747841584691';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "announcement_acknowledgements" ADD "acknowledgement_in_time" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`CREATE TYPE "public"."announcements_announcement_state_enum" AS ENUM('opened', 'closed')`);
        await queryRunner.query(`ALTER TABLE "announcements" ADD "announcement_state" "public"."announcements_announcement_state_enum" NOT NULL DEFAULT 'opened'`);
        await queryRunner.query(`ALTER TABLE "announcements" ADD "title" character varying(255) NOT NULL DEFAULT 'Default Title'`);
        await queryRunner.query(`ALTER TABLE "announcements" ADD "open_acknowledge_until" TIME WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "announcements" ADD "announcement_edit_available" boolean NOT NULL DEFAULT true`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "announcements" DROP COLUMN "announcement_edit_available"`);
        await queryRunner.query(`ALTER TABLE "announcements" DROP COLUMN "open_acknowledge_until"`);
        await queryRunner.query(`ALTER TABLE "announcements" DROP COLUMN "title"`);
        await queryRunner.query(`ALTER TABLE "announcements" DROP COLUMN "announcement_state"`);
        await queryRunner.query(`DROP TYPE "public"."announcements_announcement_state_enum"`);
        await queryRunner.query(`ALTER TABLE "announcement_acknowledgements" DROP COLUMN "acknowledgement_in_time"`);
    }
}
exports.Migration1747841584691 = Migration1747841584691;
//# sourceMappingURL=1747841584691-migration.js.map