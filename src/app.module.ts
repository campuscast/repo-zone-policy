import { Module } from '@nestjs/common';
import { MetricsModule } from '@campuscast/shared-libs';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZonesModule } from './zones/zones.module';
import { PoliciesModule } from './policies/policies.module';
import { GroupsModule } from './groups/groups.module';
import { Zone } from './zones/zone.entity';
import { ZonePolicy } from './policies/zone-policy.entity';
import { ScreenGroup } from './groups/screen-group.entity';
import { Init1700000000000 } from './migrations/1700000000000-Init';
import { AddScreenGroupDescription1700000000001 } from './migrations/1700000000001-AddScreenGroupDescription';
import { AddScreenGroupLayout1700000000002 } from './migrations/1700000000002-AddScreenGroupLayout';
import { HealthController } from './common/health.controller';
import { appConfig, dbConfig, validate } from './config';

const dbSynchronize = process.env.DB_SYNCHRONIZE === 'true';
const dbMigrationsRun = process.env.DB_MIGRATIONS_RUN !== 'false';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, dbConfig],
      validate,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL || 'postgresql://campuscast:campuscast@localhost:5432/zone_policy_db',
      entities: [Zone, ZonePolicy, ScreenGroup],
      migrations: [Init1700000000000, AddScreenGroupDescription1700000000001, AddScreenGroupLayout1700000000002],
      migrationsRun: dbMigrationsRun,
      synchronize: dbSynchronize,
      logging: process.env.NODE_ENV === 'development',
    }),
    ZonesModule, PoliciesModule, GroupsModule,
      MetricsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
