"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1745961894731 = void 0;
class Migration1745961894731 {
    name = 'Migration1745961894731';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "clients" ADD CONSTRAINT "UQ_22f7e5f9138149a624c88dfcc84" UNIQUE ("client_name")`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "clients" DROP CONSTRAINT "UQ_22f7e5f9138149a624c88dfcc84"`);
    }
}
exports.Migration1745961894731 = Migration1745961894731;
//# sourceMappingURL=1745961894731-migration.js.map