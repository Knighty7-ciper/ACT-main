import { MigrationInterface, QueryRunner } from "typeorm";

export class EnhanceComplianceReportsTable1730353475000 implements MigrationInterface {
    name = 'EnhanceComplianceReportsTable1730353475000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Check if compliance_reports table exists
        const tableExists = await queryRunner.query(`SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'compliance_reports'
        )`);
        
        if (!tableExists[0].exists) {
            // Create the table if it doesn't exist
            await queryRunner.query(`CREATE TABLE "compliance_reports" (
                "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
                "reportType" varchar(100) NOT NULL,
                "title" varchar(255) NOT NULL,
                "description" text,
                "status" varchar(50) NOT NULL DEFAULT 'draft',
                "reportPeriodStart" DATE,
                "reportPeriodEnd" DATE,
                "totalTransactions" integer DEFAULT 0,
                "totalVolume" decimal(15,2) DEFAULT 0,
                "complianceScore" decimal(5,2),
                "regulatoryFramework" varchar(100),
                "submissionDeadline" TIMESTAMP,
                "submissionDate" TIMESTAMP,
                "submissionStatus" varchar(50),
                "authorityName" varchar(255),
                "authorityContact" varchar(255),
                "reportData" jsonb,
                "filePath" varchar(500),
                "fileName" varchar(255),
                "fileSize" integer,
                "reviewedBy" uuid,
                "reviewDate" TIMESTAMP,
                "reviewNotes" text,
                "approvalStatus" varchar(50) DEFAULT 'pending',
                "approvedBy" uuid,
                "approvalDate" TIMESTAMP,
                "approvalNotes" text,
                "isArchived" boolean NOT NULL DEFAULT false,
                "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
            )`);
        } else {
            // Add columns to existing table
            await queryRunner.query(`ALTER TABLE "compliance_reports" ADD COLUMN IF NOT EXISTS "totalTransactions" integer DEFAULT 0`);
            await queryRunner.query(`ALTER TABLE "compliance_reports" ADD COLUMN IF NOT EXISTS "totalVolume" decimal(15,2) DEFAULT 0`);
            await queryRunner.query(`ALTER TABLE "compliance_reports" ADD COLUMN IF NOT EXISTS "complianceScore" decimal(5,2)`);
            await queryRunner.query(`ALTER TABLE "compliance_reports" ADD COLUMN IF NOT EXISTS "regulatoryFramework" varchar(100)`);
            await queryRunner.query(`ALTER TABLE "compliance_reports" ADD COLUMN IF NOT EXISTS "submissionDeadline" TIMESTAMP`);
            await queryRunner.query(`ALTER TABLE "compliance_reports" ADD COLUMN IF NOT EXISTS "submissionDate" TIMESTAMP`);
            await queryRunner.query(`ALTER TABLE "compliance_reports" ADD COLUMN IF NOT EXISTS "submissionStatus" varchar(50)`);
            await queryRunner.query(`ALTER TABLE "compliance_reports" ADD COLUMN IF NOT EXISTS "authorityName" varchar(255)`);
            await queryRunner.query(`ALTER TABLE "compliance_reports" ADD COLUMN IF NOT EXISTS "authorityContact" varchar(255)`);
            await queryRunner.query(`ALTER TABLE "compliance_reports" ADD COLUMN IF NOT EXISTS "reportData" jsonb`);
            await queryRunner.query(`ALTER TABLE "compliance_reports" ADD COLUMN IF NOT EXISTS "filePath" varchar(500)`);
            await queryRunner.query(`ALTER TABLE "compliance_reports" ADD COLUMN IF NOT EXISTS "fileName" varchar(255)`);
            await queryRunner.query(`ALTER TABLE "compliance_reports" ADD COLUMN IF NOT EXISTS "fileSize" integer`);
            await queryRunner.query(`ALTER TABLE "compliance_reports" ADD COLUMN IF NOT EXISTS "reviewedBy" uuid`);
            await queryRunner.query(`ALTER TABLE "compliance_reports" ADD COLUMN IF NOT EXISTS "reviewDate" TIMESTAMP`);
            await queryRunner.query(`ALTER TABLE "compliance_reports" ADD COLUMN IF NOT EXISTS "reviewNotes" text`);
            await queryRunner.query(`ALTER TABLE "compliance_reports" ADD COLUMN IF NOT EXISTS "approvalStatus" varchar(50) DEFAULT 'pending'`);
            await queryRunner.query(`ALTER TABLE "compliance_reports" ADD COLUMN IF NOT EXISTS "approvedBy" uuid`);
            await queryRunner.query(`ALTER TABLE "compliance_reports" ADD COLUMN IF NOT EXISTS "approvalDate" TIMESTAMP`);
            await queryRunner.query(`ALTER TABLE "compliance_reports" ADD COLUMN IF NOT EXISTS "approvalNotes" text`);
            await queryRunner.query(`ALTER TABLE "compliance_reports" ADD COLUMN IF NOT EXISTS "isArchived" boolean NOT NULL DEFAULT false`);
        }

        // Create indexes
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_compliance_reports_reportType" ON "compliance_reports" ("reportType")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_compliance_reports_status" ON "compliance_reports" ("status")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_compliance_reports_regulatoryFramework" ON "compliance_reports" ("regulatoryFramework")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_compliance_reports_submissionDeadline" ON "compliance_reports" ("submissionDeadline")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_compliance_reports_createdAt" ON "compliance_reports" ("createdAt")`);

        // Add foreign key constraints if table was created
        if (!tableExists[0].exists) {
            await queryRunner.query(`ALTER TABLE "compliance_reports" ADD CONSTRAINT "FK_compliance_reports_reviewedBy" FOREIGN KEY ("reviewedBy") REFERENCES "users"("id") ON DELETE SET NULL`);
            await queryRunner.query(`ALTER TABLE "compliance_reports" ADD CONSTRAINT "FK_compliance_reports_approvedBy" FOREIGN KEY ("approvedBy") REFERENCES "users"("id") ON DELETE SET NULL`);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Check if table exists before dropping constraints
        const tableExists = await queryRunner.query(`SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'compliance_reports'
        )`);

        if (tableExists[0].exists) {
            try {
                await queryRunner.query(`ALTER TABLE "compliance_reports" DROP CONSTRAINT "FK_compliance_reports_approvedBy"`);
                await queryRunner.query(`ALTER TABLE "compliance_reports" DROP CONSTRAINT "FK_compliance_reports_reviewedBy"`);
            } catch (error) {
                // Constraints might not exist if table already existed
            }

            // Drop indexes
            await queryRunner.query(`DROP INDEX IF EXISTS "IDX_compliance_reports_createdAt"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "IDX_compliance_reports_submissionDeadline"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "IDX_compliance_reports_regulatoryFramework"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "IDX_compliance_reports_status"`);
            await queryRunner.query(`DROP INDEX IF EXISTS "IDX_compliance_reports_reportType"`);

            // Drop columns (only if they were added)
            try {
                await queryRunner.query(`ALTER TABLE "compliance_reports" DROP COLUMN "isArchived"`);
                await queryRunner.query(`ALTER TABLE "compliance_reports" DROP COLUMN "approvalNotes"`);
                await queryRunner.query(`ALTER TABLE "compliance_reports" DROP COLUMN "approvalDate"`);
                await queryRunner.query(`ALTER TABLE "compliance_reports" DROP COLUMN "approvedBy"`);
                await queryRunner.query(`ALTER TABLE "compliance_reports" DROP COLUMN "approvalStatus"`);
                await queryRunner.query(`ALTER TABLE "compliance_reports" DROP COLUMN "reviewNotes"`);
                await queryRunner.query(`ALTER TABLE "compliance_reports" DROP COLUMN "reviewDate"`);
                await queryRunner.query(`ALTER TABLE "compliance_reports" DROP COLUMN "reviewedBy"`);
                await queryRunner.query(`ALTER TABLE "compliance_reports" DROP COLUMN "fileSize"`);
                await queryRunner.query(`ALTER TABLE "compliance_reports" DROP COLUMN "fileName"`);
                await queryRunner.query(`ALTER TABLE "compliance_reports" DROP COLUMN "filePath"`);
                await queryRunner.query(`ALTER TABLE "compliance_reports" DROP COLUMN "reportData"`);
                await queryRunner.query(`ALTER TABLE "compliance_reports" DROP COLUMN "authorityContact"`);
                await queryRunner.query(`ALTER TABLE "compliance_reports" DROP COLUMN "authorityName"`);
                await queryRunner.query(`ALTER TABLE "compliance_reports" DROP COLUMN "submissionStatus"`);
                await queryRunner.query(`ALTER TABLE "compliance_reports" DROP COLUMN "submissionDate"`);
                await queryRunner.query(`ALTER TABLE "compliance_reports" DROP COLUMN "submissionDeadline"`);
                await queryRunner.query(`ALTER TABLE "compliance_reports" DROP COLUMN "regulatoryFramework"`);
                await queryRunner.query(`ALTER TABLE "compliance_reports" DROP COLUMN "complianceScore"`);
                await queryRunner.query(`ALTER TABLE "compliance_reports" DROP COLUMN "totalVolume"`);
                await queryRunner.query(`ALTER TABLE "compliance_reports" DROP COLUMN "totalTransactions"`);
            } catch (error) {
                // Columns might not exist if table already had them
            }
        }
    }

}