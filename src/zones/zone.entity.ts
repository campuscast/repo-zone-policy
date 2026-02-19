import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { ScreenGroup } from '../groups/screen-group.entity';

@Entity('zones')
export class Zone {
  @PrimaryGeneratedColumn('uuid')
  zone_id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => ScreenGroup, g => g.zone)
  groups: ScreenGroup[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
