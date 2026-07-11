import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRoomTable1783341238634 implements MigrationInterface {
  name = 'AddRoomTable1783341238634';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "rooms" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(120) NOT NULL, "description" text NOT NULL, "pricePerNight" numeric(10,2) NOT NULL, "capacity" integer NOT NULL, "isAvailable" boolean NOT NULL DEFAULT true, "amount" integer NOT NULL DEFAULT '0', "amountAvailable" integer NOT NULL DEFAULT '0', "mainImageUrl" character varying(500) NOT NULL, "imageUrls" text array NOT NULL DEFAULT '{}', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_0368a2d7c215f2d0458a54933f2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_48b79438f8707f3d9ca83d85ea" ON "rooms" ("name") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_48b79438f8707f3d9ca83d85ea"`,
    );
    await queryRunner.query(`DROP TABLE "rooms"`);
  }
}
