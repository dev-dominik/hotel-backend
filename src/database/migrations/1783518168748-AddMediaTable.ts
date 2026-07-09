import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMediaTable1783518168748 implements MigrationInterface {
  name = 'AddMediaTable1783518168748';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "media" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "url" character varying(1000) NOT NULL, "publicId" character varying(500) NOT NULL, "folder" character varying(100), "format" character varying(20), "bytes" integer, "width" integer, "height" integer, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_f4e0fcac36e050de337b670d8bd" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_d1c934b93ad5ea81456fc1f304" ON "media" ("publicId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_d1c934b93ad5ea81456fc1f304"`,
    );
    await queryRunner.query(`DROP TABLE "media"`);
  }
}
