import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateUserAddRefreshToken1739106591515 implements MigrationInterface {
    name = 'UpdateUserAddRefreshToken1739106591515'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ADD "refreshToken" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "refreshToken"`);
    }

}
