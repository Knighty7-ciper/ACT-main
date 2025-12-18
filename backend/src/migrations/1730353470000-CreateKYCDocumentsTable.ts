import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateKYCDocumentsTable1730353470000 implements MigrationInterface {
    name = 'CreateKYCDocumentsTable1730353470000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "kyc_documents" (
            "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
            "userId" uuid NOT NULL,
            "documentType" varchar(100) NOT NULL,
            "fileName" varchar(255) NOT NULL,
            "filePath" varchar(500) NOT NULL,
            "fileSize" integer,
            "mimeType" varchar(100),
            "status" varchar(50) NOT NULL DEFAULT 'pending',
            "verificationScore" decimal(5,2),
            "verificationStatus" varchar(50) NOT NULL DEFAULT 'pending',
            "verificationNotes" text,
            "verifiedBy" uuid,
            "verifiedAt" TIMESTAMP,
            "expirationDate" DATE,
            "documentHash" varchar(255),
            "rejectionReason" text,
            "fraudDetected" boolean NOT NULL DEFAULT false,
            "fraudIndicators" jsonb,
            "aiAnalysisResults" jsonb,
            "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
            "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
        )`);

        await queryRunner.query(`CREATE INDEX "IDX_kyc_documents_userId" ON "kyc_documents" ("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_kyc_documents_documentType" ON "kyc_documents" ("documentType")`);
        await queryRunner.query(`CREATE INDEX "IDX_kyc_documents_status" ON "kyc_documents" ("status")`);
        await queryRunner.query(`CREATE INDEX "IDX_kyc_documents_createdAt" ON "kyc_documents" ("createdAt")`);
        await queryRunner.query(`CREATE INDEX "IDX_kyc_documents_expirationDate" ON "kyc_documents" ("expirationDate")`);

        // Add foreign key constraints
        await queryRunner.query(`ALTER TABLE "kyc_documents" ADD CONSTRAINT "FK_kyc_documents_userId" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE`);
        await queryRunner.query(`ALTER TABLE "kyc_documents" ADD CONSTRAINT "FK_kyc_documents_verifiedBy" FOREIGN KEY ("verifiedBy") REFERENCES "users"("id") ON DELETE SET NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "kyc_documents" DROP CONSTRAINT "FK_kyc_documents_verifiedBy"`);
        await queryRunner.query(`ALTER TABLE "kyc_documents" DROP CONSTRAINT "FK_kyc_documents_userId"`);

        await queryRunner.query(`DROP INDEX "IDX_kyc_documents_expirationDate"`);
        await queryRunner.query(`DROP INDEX "IDX_kyc_documents_createdAt"`);
        await queryRunner.query(`DROP INDEX "IDX_kyc_documents_status"`);
        await queryRunner.query(`DROP INDEX "IDX_kyc_documents_documentType"`);
        await queryRunner.query(`DROP INDEX "IDX_kyc_documents_userId"`);

        await queryRunner.query(`DROP TABLE "kyc_documents"`);
    }

}