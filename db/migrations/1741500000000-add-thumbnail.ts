import { MigrationInterface, QueryRunner } from "typeorm";

export class AddThumbnail1741500000000 implements MigrationInterface {
    name = 'AddThumbnail1741500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "image" ADD "thumbnailPath" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "image" DROP COLUMN "thumbnailPath"`);
    }
}
