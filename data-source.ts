import { DataSource } from 'typeorm';
import { Zone } from './src/zones/zone.entity';
import { ZonePolicy } from './src/policies/zone-policy.entity';
import { ScreenGroup } from './src/groups/screen-group.entity';
import { Init1700000000000 } from './src/migrations/1700000000000-Init';
import { AddScreenGroupDescription1700000000001 } from './src/migrations/1700000000001-AddScreenGroupDescription';
import { AddScreenGroupLayout1700000000002 } from './src/migrations/1700000000002-AddScreenGroupLayout';

export default new DataSource({
  type: 'postgres',
  url:
    process.env.DATABASE_URL ||
    'postgresql://campuscast:campuscast@localhost:5432/zone_policy_db',
  entities: [Zone, ZonePolicy, ScreenGroup],
  migrations: [Init1700000000000, AddScreenGroupDescription1700000000001, AddScreenGroupLayout1700000000002],
});
