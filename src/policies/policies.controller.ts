import { Controller, Get, Param } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ZonePolicy } from './zone-policy.entity';

@Controller('zones/:zoneId/policy')
export class PoliciesController {
  constructor(@InjectRepository(ZonePolicy) private repo: Repository<ZonePolicy>) {}

  @Get()
  async get(@Param('zoneId') zoneId: string) {
    return this.repo.findOne({ where: { zone_id: zoneId } });
  }
}
