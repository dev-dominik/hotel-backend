import { MigrationInterface, QueryRunner } from 'typeorm';

export class GoogleFacebookAuth1779208574707 implements MigrationInterface {
  name = 'GoogleFacebookAuth1779208574707';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."user_authprovider_enum" AS ENUM('local', 'google', 'facebook')`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "authProvider" "public"."user_authprovider_enum" NOT NULL DEFAULT 'local'`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "passwordHash" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ALTER COLUMN "passwordHash" SET NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "authProvider"`);
    await queryRunner.query(`DROP TYPE "public"."user_authprovider_enum"`);
  }
}
