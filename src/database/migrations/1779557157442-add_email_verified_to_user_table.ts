import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEmailVerifiedToUserTable1779557157442 implements MigrationInterface {
  name = 'AddEmailVerifiedToUserTable1779557157442';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "emailVerified" boolean NOT NULL DEFAULT false`,
    );
    await queryRunner.query(
      `ALTER TABLE "user" ADD "emailConfirmToken" character varying`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" DROP COLUMN "emailConfirmToken"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "emailVerified"`);
  }
}
