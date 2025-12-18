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
import { JsonData } from '../types/index';

@Entity('kyc_documents')
export class KYCDocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  documentType: string; // 'national_id', 'passport', 'drivers_license', 'utility_bill', 'bank_statement', 'income_proof', 'proof_of_address'

  @Column({ type: 'varchar' })
  documentCategory: string; // 'identity', 'address', 'income', 'employment', 'other'

  @Column({ type: 'varchar' })
  fileName: string;

  @Column({ type: 'varchar' })
  filePath: string;

  @Column({ type: 'varchar' })
  mimeType: string;

  @Column({ type: 'integer' })
  fileSize: number; // File size in bytes

  @Column({ type: 'varchar', default: 'pending' })
  status: string; // 'pending', 'verified', 'rejected', 'expired', 'requires_update'

  @Column({ type: 'varchar', nullable: true })
  verificationProvider?: string; // Provider used for document verification

  @Column({ type: 'json', nullable: true })
  verificationResult?: JsonData; // Results from document verification service

  @Column({ type: 'decimal', precision: 3, scale: 2, nullable: true })
  confidenceScore?: number; // AI verification confidence score (0-1)

  @Column({ type: 'varchar', nullable: true })
  extractedData?: string; // JSON string of extracted data from document

  @Column({ type: 'text', nullable: true })
  rejectionReason?: string; // Reason for rejection if applicable

  @Column({ type: 'timestamp', nullable: true })
  verifiedAt?: Date;

  @Column({ type: 'varchar', nullable: true })
  verifiedBy?: string; // Admin user ID who verified

  @Column({ type: 'varchar', nullable: true })
  expiryDate?: Date; // Document expiry date if applicable

  @Column({ type: 'boolean', default: false })
  requiresManualReview: boolean;

  @Column({ type: 'text', nullable: true })
  reviewNotes?: string;

  @Column({ type: 'timestamp', nullable: true })
  lastReviewed?: Date;

  @Column({ type: 'varchar', nullable: true })
  reviewerNotes?: string;

  @Column({ type: 'varchar', nullable: true })
  country?: string; // Country that issued the document

  @Column({ type: 'varchar', nullable: true })
  documentNumber?: string; // Document number (hashed or masked)

  @Column({ type: 'varchar', nullable: true })
  issuingAuthority?: string; // Authority that issued the document

  @Column({ type: 'json', nullable: true })
  securityFeatures?: JsonData; // Document security features verification results

  @Column({ type: 'boolean', default: false })
  fraudDetected: boolean;

  @Column({ type: 'text', nullable: true })
  fraudFlags?: string; // Reasons why fraud was suspected

  @Column({ type: 'json', nullable: true })
  ocrData?: JsonData; // OCR extracted text data

  @Column({ type: 'boolean', default: false })
  isDuplicate: boolean; // Whether this document appears to be a duplicate

  @Column({ type: 'varchar', nullable: true })
  duplicateOf?: string; // Reference to duplicate document ID

  @Column({ type: 'varchar', nullable: true })
  hash?: string; // File hash for deduplication

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ type: 'uuid' })
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}