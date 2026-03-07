import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Zone } from './zone.entity';
import { AuditClient } from '@campuscast/shared-libs';

@Injectable()
export class ZonesService {
  private readonly logger = new Logger(ZonesService.name);
  private readonly auditClient = new AuditClient();
  private readonly syncServiceUrl = process.env.SYNC_SERVICE_URL || 'http://localhost:3006';

  constructor(@InjectRepository(Zone) private repo: Repository<Zone>) {}

  findAll(page: number, pageSize: number) {
    return this.repo.findAndCount({ skip: (page - 1) * pageSize, take: pageSize, relations: ['groups'] });
  }

  async findOne(zoneId: string) {
    const zone = await this.repo.findOne({ where: { zone_id: zoneId }, relations: ['groups'] });
    if (!zone) throw new NotFoundException('Zone not found');
    return zone;
  }

  async create(data: Partial<Zone>) {
    const zone = await this.repo.save(this.repo.create(data));
    this.auditClient.append({
      event_type: 'zone.created',
      actor_type: 'system',
      actor_id: 'zone-policy-service',
      zone_id: zone.zone_id,
      resource_type: 'zone',
      resource_id: zone.zone_id,
      action: 'zone_created',
      detail: { name: zone.name },
    });
    return zone;
  }

  async update(zoneId: string, data: Partial<Zone>) {
    const zone = await this.findOne(zoneId);
    Object.assign(zone, data);
    const saved = await this.repo.save(zone);
    this.auditClient.append({
      event_type: 'zone.updated',
      actor_type: 'system',
      actor_id: 'zone-policy-service',
      zone_id: zoneId,
      resource_type: 'zone',
      resource_id: zoneId,
      action: 'zone_updated',
      detail: data,
    });
    return saved;
  }

  async remove(zoneId: string) {
    const zone = await this.findOne(zoneId);
    await this.repo.remove(zone);
    this.auditClient.append({
      event_type: 'zone.deleted',
      actor_type: 'system',
      actor_id: 'zone-policy-service',
      zone_id: zoneId,
      resource_type: 'zone',
      resource_id: zoneId,
      action: 'zone_deleted',
    });
    return { deleted: true };
  }

  /** Push config update to devices via sync-service MQTT */
  async pushConfigUpdate(zoneId: string, groupId: string, config: any) {
    try {
      await fetch(`${this.syncServiceUrl}/mqtt/publish-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zone_id: zoneId, group_id: groupId, config }),
        signal: AbortSignal.timeout(3000),
      });
    } catch (err) {
      this.logger.warn(`MQTT config push failed: ${(err as Error).message}`);
    }
  }
}
