import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('zone_policies')
export class ZonePolicy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  zone_id: string;

  @Column({ default: 100 })
  max_schedule_slots: number;

  @Column({ default: 500 })
  max_content_size_mb: number;

  @Column('simple-array', { default: 'video/mp4,image/png,image/jpeg' })
  allowed_content_types: string[];

  @Column({ default: false })
  crdt_enabled: boolean;

  @Column({ default: 60 })
  max_ops_per_minute: number;

  @Column({ default: 50 })
  max_batch_size: number;

  @Column('jsonb', { default: '[]' })
  priority_rules: { rule_id: string; priority: number; description: string }[];

  @UpdateDateColumn()
  updated_at: Date;
}
