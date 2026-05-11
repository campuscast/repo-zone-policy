import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Zone } from '../zones/zone.entity';

export type ScreenGroupLayoutItem = {
  device_id: string;
  display_id: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

@Entity('screen_groups')
export class ScreenGroup {
  @PrimaryGeneratedColumn('uuid')
  group_id: string;

  @Column()
  zone_id: string;

  @Column()
  name: string;

  @Column({ type: 'varchar', nullable: true })
  description?: string | null;

  @Column({ type: 'jsonb', default: () => '\'[]\'::jsonb' })
  layout_items: ScreenGroupLayoutItem[];

  @ManyToOne(() => Zone, z => z.groups)
  @JoinColumn({ name: 'zone_id' })
  zone: Zone;

  @CreateDateColumn()
  created_at: Date;
}
