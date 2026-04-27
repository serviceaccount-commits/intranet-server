"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration1743118282777 = void 0;
class Migration1743118282777 {
    name = 'Migration1743118282777';
    async up(queryRunner) {
        await queryRunner.query(`ALTER TABLE "staff_directory_order" ADD "order_id" SERIAL NOT NULL`);
        await queryRunner.query(`ALTER TABLE "staff_directory_order" DROP CONSTRAINT "PK_6d23d677d00b6eed00a9a20b554"`);
        await queryRunner.query(`ALTER TABLE "staff_directory_order" ADD CONSTRAINT "PK_923204567e0387b040b46b60a32" PRIMARY KEY ("order", "order_id")`);
        await queryRunner.query(`ALTER TABLE "staff_directory_order" DROP CONSTRAINT "PK_923204567e0387b040b46b60a32"`);
        await queryRunner.query(`ALTER TABLE "staff_directory_order" ADD CONSTRAINT "PK_71e5c8722dbf269f269959510e2" PRIMARY KEY ("order_id")`);
        await queryRunner.query(`ALTER TABLE "staff_directory_order" ADD CONSTRAINT "UQ_6d23d677d00b6eed00a9a20b554" UNIQUE ("order")`);
        await queryRunner.query(`ALTER TABLE "staff_directory_order" ALTER COLUMN "order" DROP DEFAULT`);
        await queryRunner.query(`DROP SEQUENCE "staff_directory_order_order_seq"`);
        await queryRunner.query(`CREATE INDEX "IDX_6d23d677d00b6eed00a9a20b55" ON "staff_directory_order" ("order") `);
        await queryRunner.query(`CREATE INDEX "IDX_5c2d0340c189f06d4424944ba0" ON "staff_directory_order" ("column_name") `);
    }
    async down(queryRunner) {
        await queryRunner.query(`DROP INDEX "public"."IDX_5c2d0340c189f06d4424944ba0"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_6d23d677d00b6eed00a9a20b55"`);
        await queryRunner.query(`CREATE SEQUENCE IF NOT EXISTS "staff_directory_order_order_seq" OWNED BY "staff_directory_order"."order"`);
        await queryRunner.query(`ALTER TABLE "staff_directory_order" ALTER COLUMN "order" SET DEFAULT nextval('"staff_directory_order_order_seq"')`);
        await queryRunner.query(`ALTER TABLE "staff_directory_order" DROP CONSTRAINT "UQ_6d23d677d00b6eed00a9a20b554"`);
        await queryRunner.query(`ALTER TABLE "staff_directory_order" DROP CONSTRAINT "PK_71e5c8722dbf269f269959510e2"`);
        await queryRunner.query(`ALTER TABLE "staff_directory_order" ADD CONSTRAINT "PK_923204567e0387b040b46b60a32" PRIMARY KEY ("order", "order_id")`);
        await queryRunner.query(`ALTER TABLE "staff_directory_order" DROP CONSTRAINT "PK_923204567e0387b040b46b60a32"`);
        await queryRunner.query(`ALTER TABLE "staff_directory_order" ADD CONSTRAINT "PK_6d23d677d00b6eed00a9a20b554" PRIMARY KEY ("order")`);
        await queryRunner.query(`ALTER TABLE "staff_directory_order" DROP COLUMN "order_id"`);
    }
}
exports.Migration1743118282777 = Migration1743118282777;
//# sourceMappingURL=1743118282777-migration.js.map