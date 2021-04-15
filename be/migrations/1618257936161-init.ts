import { MigrationInterface, QueryRunner } from 'typeorm';

export class init1618257936161 implements MigrationInterface {
  name = 'init1618257936161';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "user_source_enum" AS ENUM('COGNITO', 'AUTH0')`,
    );
    await queryRunner.query(
      `CREATE TABLE "user" ("id" character varying NOT NULL, "source" "user_source_enum" NOT NULL, "email" character varying NOT NULL, CONSTRAINT "PK_63a4f029d350464e25d1ba57bdf" PRIMARY KEY ("id", "source"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user"`);
    await queryRunner.query(`DROP TYPE "user_source_enum"`);
  }
}
