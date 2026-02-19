import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Zone } from '../zones/zone.entity';

@Entity('screen_groups')
export class ScreenGroup {
  @PrimaryGeneratedColumn('uuid')
  group_id: string;

  @Column()
  zone_id: string;

  @Column()
  name: string;

  @ManyToOne(() => Zone, z => z.groups)
  @JoinColumn({ name: 'zone_id' })
  zone: Zone;

  @CreateDateColumn()
  created_at: Date;
}
