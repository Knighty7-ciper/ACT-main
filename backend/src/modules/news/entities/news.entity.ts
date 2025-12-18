import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { NewsCategoryEntity } from '../../news-category/entities/news-category.entity';

@Entity('news')
export class NewsEntity {
  @PrimaryColumn('uuid')
  id: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', nullable: true })
  summary?: string;

  @Column({ type: 'uuid' })
  categoryId: string;

  @Column({ type: 'varchar', nullable: true })
  imageUrl?: string;

  @Column({ type: 'varchar', nullable: true })
  source?: string;

  @Column({ type: 'varchar', nullable: true })
  sourceUrl?: string;

  @Column({ type: 'boolean', default: true })
  isPublished: boolean;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @ManyToOne(() => NewsCategoryEntity)
  @JoinColumn({ name: 'categoryId' })
  category: NewsCategoryEntity;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt?: Date;
}
