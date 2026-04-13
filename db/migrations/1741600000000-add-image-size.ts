import { MigrationInterface, QueryRunner } from "typeorm";

export class AddImageSize1741600000000 implements MigrationInterface {
    name = 'AddImageSize1741600000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "image" ADD "size" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "image" DROP COLUMN "size"`);
    }
}
