import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateComplianceEventsTable1730353465000 implements MigrationInterface {
    name = 'CreateComplianceEventsTable1730353465000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "compliance_events" (
            "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            "eventType" varchar(100) NOT NULL,
            "eventCategory" varchar(100) NOT NULL,
            "eventDetails" text,
            "userId" uuid,
            "entityType" varchar(100),
            "entityId" uuid,
            "regulatoryFramework" varchar(100),
            "retentionPeriodYears" integer DEFAULT 5,
            "retentionExpiresAt" TIMESTAMP,
            "createdAt" TIMESTAMP NOT NULL DEFAULT NOW()
        )`);

        await queryRunner.query(`CREATE INDEX "IDX_compliance_events_eventType" ON "compliance_events" ("eventType")`);
        await queryRunner.query(`CREATE INDEX "IDX_compliance_events_eventCategory" ON "compliance_events" ("eventCategory")`);
        await queryRunner.query(`CREATE INDEX "IDX_compliance_events_userId" ON "compliance_events" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_compliance_events_createdAt" ON "compliance_events" ("createdAt")`);
        await queryRunner.query(`CREATE INDEX "IDX_compliance_events_retentionExpiresAt" ON "compliance_events" ("retentionExpiresAt")`);

        // Add foreign key constraint
        await queryRunner.query(`ALTER TABLE "compliance_events" ADD CONSTRAINT "FK_compliance_events_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "compliance_events" DROP CONSTRAINT "FK_compliance_events_userId"`);

        await queryRunner.query(`DROP INDEX "IDX_compliance_events_retentionExpiresAt"`);
        await queryRunner.query(`DROP INDEX "IDX_compliance_events_createdAt"`);
        await queryRunner.query(`DROP INDEX "IDX_compliance_events_userId"`);
        await queryRunner.query(`DROP INDEX "IDX_compliance_events_eventCategory"`);
        await queryRunner.query(`DROP INDEX "IDX_compliance_events_eventType"`);

        await queryRunner.query(`DROP TABLE "compliance_events"`);
    }

}