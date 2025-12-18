import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateAdminAccessTable1734486000000 implements MigrationInterface {
    name = 'CreateAdminAccessTable1734486000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "admin_access" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "question" character varying NOT NULL, "answer" character varying NOT NULL, "requiredClicks" integer NOT NULL DEFAULT 4, "isActive" boolean NOT NULL DEFAULT true, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_admin_access" PRIMARY KEY ("id"))`);
        
        // Insert the default admin access question
        await queryRunner.query(`INSERT INTO "admin_access" ("question", "answer", "requiredClicks", "isActive") VALUES ('WHATS THE NAME?', 'HOME SWEET COFFEE', 4, true)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "admin_access"`);
    }
}