"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1754518482080 = void 0;
class Migration1754518482080 {
    name = 'Migration1754518482080';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "topics" DROP CONSTRAINT "FK_55f03ccaeee22a418c4b00b83a2"`);
        await queryRunner.query(`ALTER TABLE "topics" RENAME COLUMN "category_id" TO "client_id"`);
        await queryRunner.query(`ALTER TABLE "topics" ADD CONSTRAINT "FK_a732c0bd94d23273cc8f60b8709" FOREIGN KEY ("client_id") REFERENCES "clients"("client_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
    async down(queryRunner) {
        await queryRunner.query(`ALTER TABLE "topics" DROP CONSTRAINT "FK_a732c0bd94d23273cc8f60b8709"`);
        await queryRunner.query(`ALTER TABLE "topics" RENAME COLUMN "client_id" TO "category_id"`);
        await queryRunner.query(`ALTER TABLE "topics" ADD CONSTRAINT "FK_55f03ccaeee22a418c4b00b83a2" FOREIGN KEY ("category_id") REFERENCES "categories"("category_id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }
}
exports.Migration1754518482080 = Migration1754518482080;
//# sourceMappingURL=1754518482080-migration.js.map