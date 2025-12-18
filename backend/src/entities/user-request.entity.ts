import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserEntity } from '../modules/user/entities/user.entity';
import { AdminEntity } from '../modules/admin/entities/admin.entity';

@Entity('user_requests')
export class UserRequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  requestType: string; // 'profile_update', 'kyc_issue', 'transaction_help', 'general_support'

  @Column()
  subject: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'jsonb' })
  requestedData: Record<string, any>; // Data user wants to change/update

  @Column({ 
    type: 'enum', 
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  })
  status: 'open' | 'in_progress' | 'resolved' | 'closed';

  @Column({ 
    type: 'enum', 
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  })
  priority: 'low' | 'medium' | 'high' | 'urgent';

  @Column()
  userId: string;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'userId' })
  user: UserEntity;

  @Column({ nullable: true })
  assignedToAdminId: string;

  @ManyToOne(() => AdminEntity)
  @JoinColumn({ name: 'assignedToAdminId' })
  assignedToAdmin: AdminEntity;

  @Column({ nullable: true })
  resolutionNotes: string;

  @Column({ nullable: true })
  resolvedByAdminId: string;

  @ManyToOne(() => AdminEntity)
  @JoinColumn({ name: 'resolvedByAdminId' })
  resolvedByAdmin: AdminEntity;

  @Column({ type: 'timestamp', nullable: true })
  resolvedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  attachments: string[]; // File URLs for uploaded documents

  @Column({ type: 'text', nullable: true })
  internalNotes: string; // Internal admin notes not visible to user

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
