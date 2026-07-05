import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIsBlockedToUserEntity1783149683949 implements MigrationInterface {
  name = 'AddIsBlockedToUserEntity1783149683949';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user" ADD "isBlocked" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isBlocked"`);
  }
}
