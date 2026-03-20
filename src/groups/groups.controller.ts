import { Controller, Get, Post, Delete, Param, Body, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScreenGroup } from './screen-group.entity';
import { AuditClient } from '@campuscast/shared-libs';

@Controller('zones/:zoneId/groups')
export class GroupsController {
  private readonly logger = new Logger(GroupsController.name);
  private readonly auditClient = new AuditClient();
  private readonly deviceMgmtUrl = process.env.DEVICE_MANAGEMENT_URL || 'http://localhost:3004';

  constructor(@InjectRepository(ScreenGroup) private repo: Repository<ScreenGroup>) {}

  @Get()
  async list(@Param('zoneId') zoneId: string) {
    return this.repo.find({ where: { zone_id: zoneId } });
  }

  @Post()
  async create(@Param('zoneId') zoneId: string, @Body() body: { name: string; description?: string }) {
    const group = await this.repo.save(this.repo.create({
      zone_id: zoneId,
      name: body.name,
      description: body.description?.trim() || null,
    }));
    this.auditClient.append({
      event_type: 'group.created',
      actor_type: 'system',
      actor_id: 'zone-policy-service',
      zone_id: zoneId,
      resource_type: 'screen_group',
      resource_id: group.group_id,
      action: 'group_created',
      detail: { name: group.name, description: group.description || '' },
    });
    // Notify device-management of new group
    await this.syncGroupToDeviceManagement(zoneId, group.group_id, 'created');
    return group;
  }

  @Delete(':groupId')
  async remove(@Param('zoneId') zoneId: string, @Param('groupId') groupId: string) {
    const group = await this.repo.findOne({ where: { group_id: groupId, zone_id: zoneId } });
    if (group) {
      await this.repo.remove(group);
      this.auditClient.append({
        event_type: 'group.deleted',
        actor_type: 'system',
        actor_id: 'zone-policy-service',
        zone_id: zoneId,
        resource_type: 'screen_group',
        resource_id: groupId,
        action: 'group_deleted',
      });
      await this.syncGroupToDeviceManagement(zoneId, groupId, 'deleted');
    }
    return { deleted: true };
  }

  private async syncGroupToDeviceManagement(zoneId: string, groupId: string, action: string) {
    try {
      await fetch(`${this.deviceMgmtUrl}/devices/sync-group`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zone_id: zoneId, group_id: groupId, action }),
        signal: AbortSignal.timeout(3000),
      });
    } catch (err) {
      this.logger.warn(`Device-group sync failed: ${(err as Error).message}`);
    }
  }
}
