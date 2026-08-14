import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentToReservations1784703564805 implements MigrationInterface {
  name = 'AddPaymentToReservations1784703564805';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."reservations_paymenttype_enum" AS ENUM('full', 'deposit')`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" ADD "paymentType" "public"."reservations_paymenttype_enum" NOT NULL DEFAULT 'full'`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" ADD "amountPaid" numeric(10,2)`,
    );
    await queryRunner.query(
      `UPDATE "reservations" SET "amountPaid" = "totalPrice" WHERE "amountPaid" IS NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" ALTER COLUMN "amountPaid" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reservations" DROP COLUMN "amountPaid"`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" DROP COLUMN "paymentType"`,
    );
    await queryRunner.query(
      `DROP TYPE "public"."reservations_paymenttype_enum"`,
    );
  }
}
