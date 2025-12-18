import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('security_events')
export class SecurityEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  timestamp: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  eventType: string;

  @Column()
  severity: string;

  @Column()
  sourceIP: string;

  @Column({ nullable: true })
  userAgent: string;

  @Column()
  endpoint: string;

  @Column('text')
  details: string;

  @Column()
  action: string;

  @Column({ nullable: true })
  userId: string;

  @Column({ nullable: true })
  sessionId: string;

  @Column('text', { array: true, default: [] })
  tags: string[];

  @Column({ default: false })
  resolved: boolean;

  @Column({ nullable: true })
  resolvedBy: string;

  @Column({ nullable: true })
  resolvedAt: Date;

  @Column('text', { nullable: true })
  notes: string;
}