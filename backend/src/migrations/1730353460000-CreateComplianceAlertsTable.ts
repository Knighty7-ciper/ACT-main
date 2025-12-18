import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateComplianceAlertsTable1730353460000 implements MigrationInterface {
    name = 'CreateComplianceAlertsTable1730353460000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "compliance_alerts" (
            "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            "alertType" varchar(100) NOT NULL,
            "severity" varchar(50) NOT NULL DEFAULT 'medium',
            "status" varchar(50) NOT NULL DEFAULT 'open',
            "transactionId" uuid,
            "userId" uuid,
            "alertDetails" text NOT NULL,
            "resolvedAt" TIMESTAMP,
            "resolvedBy" uuid,
            "resolutionNotes" text,
            "investigationNotes" text,
            "escalatedTo" varchar(100),
            "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
        )`);

        await queryRunner.query(`CREATE INDEX "IDX_compliance_alerts_type" ON "compliance_alerts" ("alertType")`);
        await queryRunner.query(`CREATE INDEX "IDX_compliance_alerts_severity" ON "compliance_alerts" ("severity")`);
        await queryRunner.query(`CREATE INDEX "IDX_compliance_alerts_status" ON "compliance_alerts" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_compliance_alerts_userId" ON "compliance_alerts" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_compliance_alerts_createdAt" ON "compliance_alerts" ("createdAt")`);

        // Add foreign key constraints
        await queryRunner.query(`ALTER TABLE "compliance_alerts" ADD CONSTRAINT "FK_compliance_alerts_transactionId" FOREIGN KEY ("transactionId") REFERENCES "transactions"("id") ON DELETE SET NULL`);
        await queryRunner.query(`ALTER TABLE "compliance_alerts" ADD CONSTRAINT "FK_compliance_alerts_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "compliance_alerts" ADD CONSTRAINT "FK_compliance_alerts_resolvedBy" FOREIGN KEY ("resolvedBy") REFERENCES "users"("id") ON DELETE SET NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "compliance_alerts" DROP CONSTRAINT "FK_compliance_alerts_resolvedBy"`);
        await queryRunner.query(`ALTER TABLE "compliance_alerts" DROP CONSTRAINT "FK_compliance_alerts_userId"`);
        await queryRunner.query(`ALTER TABLE "compliance_alerts" DROP CONSTRAINT "FK_compliance_alerts_transactionId"`);
        
        await queryRunner.query(`DROP INDEX "IDX_compliance_alerts_createdAt"`);
        await queryRunner.query(`DROP INDEX "IDX_compliance_alerts_userId"`);
        await queryRunner.query(`DROP INDEX "IDX_compliance_alerts_status"`);
        await queryRunner.query(`DROP INDEX "IDX_compliance_alerts_severity"`);
        await queryRunner.query(`DROP INDEX "IDX_compliance_alerts_type"`);

        await queryRunner.query(`DROP TABLE "compliance_alerts"`);
    }

}