import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZonesModule } from './zones/zones.module';
import { PoliciesModule } from './policies/policies.module';
import { GroupsModule } from './groups/groups.module';
import { Zone } from './zones/zone.entity';
import { ZonePolicy } from './policies/zone-policy.entity';
import { ScreenGroup } from './groups/screen-group.entity';
import { HealthController } from './common/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://campuscast:campuscast@localhost:5432/zone_policy_db',
      entities: [Zone, ZonePolicy, ScreenGroup],
      synchronize: process.env.NODE_ENV === 'development',
    }),
    ZonesModule, PoliciesModule, GroupsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
