import { MigrationInterface, QueryRunner } from "typeorm";

export class UserUpdateAddIsblocked1741076099189 implements MigrationInterface {
    name = 'UserUpdateAddIsblocked1741076099189'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "isBlocked" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "isBlocked"`);
    }

}
