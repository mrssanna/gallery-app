import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserAvatar1741700000000 implements MigrationInterface {
    name = 'AddUserAvatar1741700000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "avatar" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "avatar"`);
    }
}
