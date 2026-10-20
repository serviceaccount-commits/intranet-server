"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1792540800000 = void 0;
// A client's address and primary contact (email, phone) no longer have to be
// unique across clients: several clients can share a parent company's office
// or contact person. Enforcing it made "Create Client" fail with a bare 500
// (and the dialog just sat there) whenever a contact was reused. The client
// name stays unique.
class Migration1792540800000 {
    name = 'Migration1792540800000';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "clients" DROP CONSTRAINT "UQ_663ef24cff96c52e43d3148f29f"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP CONSTRAINT "UQ_8ee2741ae051e538761acf99970"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP CONSTRAINT "UQ_49237b743d4115155b7524e21ab"`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "clients" ADD CONSTRAINT "UQ_49237b743d4115155b7524e21ab" UNIQUE ("primary_contact_phone")`);
        await queryRunner.query(`ALTER TABLE "clients" ADD CONSTRAINT "UQ_8ee2741ae051e538761acf99970" UNIQUE ("primary_contact_email")`);
        await queryRunner.query(`ALTER TABLE "clients" ADD CONSTRAINT "UQ_663ef24cff96c52e43d3148f29f" UNIQUE ("address")`);
    }
}
exports.Migration1792540800000 = Migration1792540800000;
//# sourceMappingURL=1792540800000-migration.js.map