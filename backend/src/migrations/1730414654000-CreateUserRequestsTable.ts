import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateUserRequestsTable1730414654000 implements MigrationInterface {
    name = 'CreateUserRequestsTable1730414654000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "requestType" character varying NOT NULL, "subject" character varying NOT NULL, "description" text NOT NULL, "requestedData" jsonb NOT NULL, "status" character varying NOT NULL DEFAULT 'open', "priority" character varying NOT NULL DEFAULT 'medium', "userId" uuid NOT NULL, "assignedToAdminId" uuid, "resolutionNotes" text, "resolvedByAdminId" uuid, "resolvedAt" TIMESTAMP, "attachments" text array, "internalNotes" text, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8bdd580b20b6fe020f45a1e6d8e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user_requests" ADD CONSTRAINT "FK_user_requests_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_requests" ADD CONSTRAINT "FK_user_requests_assignedToAdminId" FOREIGN KEY ("assignedToAdminId") REFERENCES "admin"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_requests" ADD CONSTRAINT "FK_user_requests_resolvedByAdminId" FOREIGN KEY ("resolvedByAdminId") REFERENCES "admin"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_requests" DROP CONSTRAINT "FK_user_requests_resolvedByAdminId"`);
        await queryRunner.query(`ALTER TABLE "user_requests" DROP CONSTRAINT "FK_user_requests_assignedToAdminId"`);
        await queryRunner.query(`ALTER TABLE "user_requests" DROP CONSTRAINT "FK_user_requests_userId"`);
        await queryRunner.query(`DROP TABLE "user_requests"`);
    }

}
