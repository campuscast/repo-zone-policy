import { Controller, Get, Post, Put, Param, Body, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ZonePolicy } from './zone-policy.entity';
import { AuditClient } from '@campuscast/shared-libs';

@Controller('zones/:zoneId/policy')
export class PoliciesController {
  private readonly logger = new Logger(PoliciesController.name);
  private readonly auditClient = new AuditClient();
  private readonly syncServiceUrl = process.env.SYNC_SERVICE_URL || 'http://localhost:3006';

  constructor(@InjectRepository(ZonePolicy) private repo: Repository<ZonePolicy>) {}

  @Get()
  async get(@Param('zoneId') zoneId: string) {
    const policy = await this.repo.findOne({ where: { zone_id: zoneId } });
    if (!policy) throw new NotFoundException('Policy not found for zone');
    return policy;
  }

  @Post()
  async create(@Param('zoneId') zoneId: string, @Body() body: Partial<ZonePolicy>) {
    const policy = await this.repo.save(this.repo.create({ ...body, zone_id: zoneId }));
    this.auditClient.append({
      event_type: 'policy.created',
      actor_type: 'system',
      actor_id: 'zone-policy-service',
      zone_id: zoneId,
      resource_type: 'zone_policy',
      resource_id: policy.id,
      action: 'policy_created',
      detail: { crdt_enabled: policy.crdt_enabled, max_schedule_slots: policy.max_schedule_slots },
    });
    await this.pushPolicyConfig(zoneId, policy);
    return policy;
  }

  @Put()
  async update(@Param('zoneId') zoneId: string, @Body() body: Partial<ZonePolicy>) {
    let policy = await this.repo.findOne({ where: { zone_id: zoneId } });
    if (!policy) throw new NotFoundException('Policy not found for zone');
    Object.assign(policy, body);
    policy = await this.repo.save(policy);
    this.auditClient.append({
      event_type: 'policy.updated',
      actor_type: 'system',
      actor_id: 'zone-policy-service',
      zone_id: zoneId,
      resource_type: 'zone_policy',
      resource_id: policy.id,
      action: 'policy_updated',
      detail: body,
    });
    await this.pushPolicyConfig(zoneId, policy);
    return policy;
  }

  private async pushPolicyConfig(zoneId: string, policy: ZonePolicy) {
    try {
      await fetch(`${this.syncServiceUrl}/mqtt/publish-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zone_id: zoneId,
          group_id: '*',
          config: {
            crdt_enabled: policy.crdt_enabled,
            max_ops_per_minute: policy.max_ops_per_minute,
            max_batch_size: policy.max_batch_size,
            allowed_content_types: policy.allowed_content_types,
          },
        }),
        signal: AbortSignal.timeout(3000),
      });
    } catch (err) {
      this.logger.warn(`MQTT policy config push failed: ${(err as Error).message}`);
    }
  }
}
