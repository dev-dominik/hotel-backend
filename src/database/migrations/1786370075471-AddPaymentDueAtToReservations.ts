import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentDueAtToReservations1786370075471 implements MigrationInterface {
  name = 'AddPaymentDueAtToReservations1786370075471';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reservations" ADD "paymentDueAt" TIMESTAMP WITH TIME ZONE`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" ALTER COLUMN "status" SET DEFAULT 'pending'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "reservations" ALTER COLUMN "status" SET DEFAULT 'confirmed'`,
    );
    await queryRunner.query(
      `ALTER TABLE "reservations" DROP COLUMN "paymentDueAt"`,
    );
  }
}
