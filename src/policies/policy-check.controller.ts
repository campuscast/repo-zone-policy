import { Body, Controller, Post } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ZonePolicy } from './zone-policy.entity';

@Controller('policy')
export class PolicyCheckController {
  constructor(@InjectRepository(ZonePolicy) private readonly repo: Repository<ZonePolicy>) {}

  @Post('check')
  async checkAccess(@Body() body: {
    user_id?: string;
    device_id?: string;
    zone_id: string;
    action: string;
    resource_id?: string;
  }) {
    const policy = await this.repo.findOne({ where: { zone_id: body.zone_id } });
    if (!policy) {
      return { allowed: false, reason: 'POLICY_NOT_FOUND' };
    }

    if (!body.user_id && !body.device_id) {
      return { allowed: false, reason: 'SUBJECT_REQUIRED' };
    }

    const allowedActions = new Set([
      'schedule:read',
      'schedule:write',
      'content:upload',
      'content:read',
      'sync:ingest',
      'zone:read',
      'zone:write',
    ]);
    if (!allowedActions.has(body.action)) {
      return { allowed: false, reason: `ACTION_NOT_ALLOWED:${body.action}` };
    }

    if (body.action === 'sync:ingest' && !body.device_id) {
      return { allowed: false, reason: 'DEVICE_REQUIRED_FOR_SYNC' };
    }

    return { allowed: true };
  }
}
