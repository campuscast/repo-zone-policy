import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ZonePolicy } from './zone-policy.entity';
import { PoliciesController } from './policies.controller';
import { PolicyCheckController } from './policy-check.controller';
@Module({
  imports: [TypeOrmModule.forFeature([ZonePolicy])],
  controllers: [PoliciesController, PolicyCheckController],
})
export class PoliciesModule {}
