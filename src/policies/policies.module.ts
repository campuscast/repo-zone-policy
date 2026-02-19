import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZonePolicy } from './zone-policy.entity';
import { PoliciesController } from './policies.controller';
@Module({
  imports: [TypeOrmModule.forFeature([ZonePolicy])],
  controllers: [PoliciesController],
})
export class PoliciesModule {}
