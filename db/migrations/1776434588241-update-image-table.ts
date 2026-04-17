import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateImageTable1776434588241 implements MigrationInterface {
    name = 'UpdateImageTable1776434588241'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_11200000000000000000000000"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_22200000000000000000000000"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a62473490b3e4578fd683235c5"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_90861118671407223b20d3674d"`);
        await queryRunner.query(`CREATE INDEX "IDX_2cfaa9ca57e7cbbab414f511b1" ON "image" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_365cc187ec1334a5e9188f8f25" ON "image" ("publishedAt") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_365cc187ec1334a5e9188f8f25"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_2cfaa9ca57e7cbbab414f511b1"`);
        await queryRunner.query(`CREATE INDEX "IDX_90861118671407223b20d3674d" ON "user" ("createdAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_a62473490b3e4578fd683235c5" ON "user" ("login") `);
        await queryRunner.query(`CREATE INDEX "IDX_22200000000000000000000000" ON "image" ("publishedAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_11200000000000000000000000" ON "image" ("createdAt") `);
    }

}
