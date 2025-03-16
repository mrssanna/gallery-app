import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserAddColumns1739189074614 implements MigrationInterface {
    name = 'UpdateUserAddColumns1739189074614'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'user')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "role" "public"."user_role_enum" NOT NULL DEFAULT 'user'`);
        await queryRunner.query(`CREATE TYPE "public"."user_gender_enum" AS ENUM('мужской', 'женский')`);
        await queryRunner.query(`ALTER TABLE "user" ADD "gender" "public"."user_gender_enum"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "firstName" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "middleName" character varying`);
        await queryRunner.query(`ALTER TABLE "user" ADD "lastName" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "lastName"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "middleName"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "firstName"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "gender"`);
        await queryRunner.query(`DROP TYPE "public"."user_gender_enum"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "role"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    }

}
