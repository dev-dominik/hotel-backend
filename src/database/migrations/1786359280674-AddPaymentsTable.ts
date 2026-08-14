import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPaymentsTable1786359280674 implements MigrationInterface {
  name = 'AddPaymentsTable1786359280674';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."payments_provider_enum" AS ENUM('STRIPE')`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."payments_status_enum" AS ENUM('CREATED', 'REGISTERING', 'PENDING', 'VERIFYING', 'PAID', 'FAILED', 'CANCELLED')`,
    );
    await queryRunner.query(
      `CREATE TABLE "payments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reservationId" uuid NOT NULL, "provider" "public"."payments_provider_enum" NOT NULL, "status" "public"."payments_status_enum" NOT NULL DEFAULT 'CREATED', "amount" bigint NOT NULL, "currency" character varying(3) NOT NULL, "providerPaymentId" character varying(255), "providerSessionId" character varying(255), "providerToken" character varying(512), "paidAt" TIMESTAMP WITH TIME ZONE, "failedAt" TIMESTAMP WITH TIME ZONE, "cancelledAt" TIMESTAMP WITH TIME ZONE, "refundedAt" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_197ab7af18c93fbb0c9b28b4a59" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_payment_provider_external_id" ON "payments" ("provider", "providerPaymentId") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_payment_order_id" ON "payments" ("reservationId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."idx_payment_order_id"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_payment_provider_external_id"`,
    );
    await queryRunner.query(`DROP TABLE "payments"`);
    await queryRunner.query(`DROP TYPE "public"."payments_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."payments_provider_enum"`);
  }
}
