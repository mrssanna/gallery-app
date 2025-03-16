import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateTablesScheme1740474924789 implements MigrationInterface {
    name = 'UpdateTablesScheme1740474924789'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "image" ALTER COLUMN "title" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "image" ALTER COLUMN "author" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "image" ALTER COLUMN "publishedAt" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "image" ALTER COLUMN "publishedAt" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "image" ALTER COLUMN "publishedAt" SET DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "image" ALTER COLUMN "publishedAt" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "image" ALTER COLUMN "author" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "image" ALTER COLUMN "title" SET NOT NULL`);
    }

}
