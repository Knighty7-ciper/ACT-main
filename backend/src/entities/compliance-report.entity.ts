import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { UserEntity } from '../modules/user/entities/user.entity';
import { JsonData, ValidationError } from '../types/index';

@Entity('compliance_reports')
export class ComplianceReportEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  reportType: string; // 'sar', 'ctr', 'cmir', 'monthly_summary', 'quarterly_compliance', 'annual_review', 'custom'

  @Column({ type: 'varchar' })
  reportCategory: string; // 'aml', 'kyc', 'transactions', 'risk_assessment', 'regulatory'

  @Column({ type: 'varchar' })
  regulatoryFramework: string; // 'BSA', 'FATF', 'EU_5AMLD', 'AU_AML', 'custom'

  @Column({ type: 'varchar' })
  period: string; // 'monthly', 'quarterly', 'annual', 'on_demand', 'real_time'

  @Column({ type: 'timestamp' })
  periodStart: Date;

  @Column({ type: 'timestamp' })
  periodEnd: Date;

  @Column({ type: 'varchar' })
  status: string; // 'draft', 'review', 'approved', 'submitted', 'accepted', 'rejected'

  @Column({ type: 'json' })
  reportData: JsonData; // Structured report data

  @Column({ type: 'json', nullable: true })
  summary: JsonData; // Report summary and key findings

  @Column({ type: 'json', nullable: true })
  findings: JsonData; // Key findings and alerts included

  @Column({ type: 'integer', default: 0 })
  totalTransactions: number; // Total transactions covered in report

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  totalVolume: number; // Total transaction volume

  @Column({ type: 'integer', default: 0 })
  suspiciousTransactions: number; // Number of flagged suspicious transactions

  @Column({ type: 'integer', default: 0 })
  alertsGenerated: number; // Number of compliance alerts generated

  @Column({ type: 'varchar', nullable: true })
  filePath?: string; // Path to generated report file

  @Column({ type: 'varchar', nullable: true })
  fileFormat: string; // 'pdf', 'xml', 'json', 'csv', 'xlsx'

  @Column({ type: 'varchar', nullable: true })
  fileHash?: string; // Hash of generated file for integrity

  @Column({ type: 'varchar', nullable: true })
  externalReference?: string; // Reference number from regulatory authority

  @Column({ type: 'timestamp', nullable: true })
  submittedAt?: Date; // When report was submitted

  @Column({ type: 'timestamp', nullable: true })
  acceptedAt?: Date; // When report was accepted by authority

  @Column({ type: 'timestamp', nullable: true })
  dueDate?: Date; // Regulatory submission deadline

  @Column({ type: 'varchar', nullable: true })
  authorityName?: string; // Regulatory authority receiving report

  @Column({ type: 'json', nullable: true })
  validationErrors?: ValidationError[]; // Validation errors if report was rejected

  @Column({ type: 'text', nullable: true })
  submissionNotes?: string; // Notes about submission process

  @Column({ type: 'boolean', default: false })
  automatedGeneration: boolean; // Whether this report was auto-generated

  @Column({ type: 'json', nullable: true })
  filters: JsonData; // Filters used to select data for report

  @Column({ type: 'json', nullable: true })
  configuration: JsonData; // Report generation configuration

  @Column({ type: 'integer', nullable: true })
  version: number; // Report version number

  @Column({ type: 'boolean', default: false })
  includesPersonalData: boolean; // Whether report contains personal data

  @Column({ type: 'varchar', nullable: true })
  retentionPeriod?: string; // How long this report should be retained

  @Column({ type: 'timestamp', nullable: true })
  archiveDate?: Date; // When report should be archived

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'createdBy' })
  createdByUser: UserEntity;

  @Column({ type: 'uuid', nullable: true })
  createdBy: string; // Admin user ID who generated report

  @Column({ type: 'uuid', nullable: true })
  approvedBy?: string; // Admin user ID who approved report

  @Column({ type: 'timestamp', nullable: true })
  approvedAt?: Date;

  @CreateDateColumn()
  generatedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}