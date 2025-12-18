import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserKYCFields1730353456000 implements MigrationInterface {
    name = 'AddUserKYCFields1730353456000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD "kycLevel" varchar(50) NOT NULL DEFAULT 'none'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "kycStatus" varchar(50) NOT NULL DEFAULT 'not_started'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "kycVerifiedAt" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD "identityVerified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "documentVerified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "addressVerified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "isPEP" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "pepCategory" varchar(100)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "sanctionsScreeningStatus" varchar(50) NOT NULL DEFAULT 'not_screened'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "lastSanctionsCheck" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD "sourceOfFunds" varchar(200)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "sourceOfFundsVerified" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "employmentStatus" varchar(100)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "occupation" varchar(200)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "estimatedNetWorth" decimal(15,2)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "transactionLimitDaily" decimal(15,2) DEFAULT 1000`);
        await queryRunner.query(`ALTER TABLE "users" ADD "transactionLimitMonthly" decimal(15,2) DEFAULT 10000`);
        await queryRunner.query(`ALTER TABLE "users" ADD "riskRating" integer DEFAULT 50`);
        await queryRunner.query(`ALTER TABLE "users" ADD "riskAssessmentDate" TIMESTAMP`);
        await queryRunner.query(`ALTER TABLE "users" ADD "enhancedDueDiligence" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "regulatoryReportingRequired" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "taxId" varchar(100)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "dateOfBirth" DATE`);
        await queryRunner.query(`ALTER TABLE "users" ADD "nationality" varchar(100)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "residenceCountry" varchar(100)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "businessActivity" varchar(200)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "expectedTransactionVolume" decimal(15,2)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "accountPurpose" varchar(200)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "accountPurpose"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "expectedTransactionVolume"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "businessActivity"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "residenceCountry"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "nationality"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "dateOfBirth"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "taxId"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "regulatoryReportingRequired"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "enhancedDueDiligence"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "riskAssessmentDate"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "riskRating"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "transactionLimitMonthly"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "transactionLimitDaily"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "estimatedNetWorth"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "occupation"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "employmentStatus"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "sourceOfFundsVerified"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "sourceOfFunds"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "lastSanctionsCheck"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "sanctionsScreeningStatus"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "pepCategory"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "isPEP"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "addressVerified"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "documentVerified"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "identityVerified"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "kycVerifiedAt"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "kycStatus"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "kycLevel"`);
    }

}