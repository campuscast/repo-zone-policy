import { BadRequestException, Controller, Delete, Get, Logger, NotFoundException, Param, Body, Post, Put } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ScreenGroup, type ScreenGroupLayoutItem } from './screen-group.entity';
import { AuditClient } from '@campuscast/shared-libs';

@Controller('zones/:zoneId/groups')
export class GroupsController {
  private readonly logger = new Logger(GroupsController.name);
  private readonly auditClient = new AuditClient();
  private readonly deviceMgmtUrl = process.env.DEVICE_MANAGEMENT_URL || 'http://localhost:3004';

  constructor(@InjectRepository(ScreenGroup) private repo: Repository<ScreenGroup>) {}

  private normalizeLayoutItems(rawItems: unknown): ScreenGroupLayoutItem[] {
    if (!Array.isArray(rawItems)) {
      throw new BadRequestException('items must be an array');
    }

    const seen = new Set<string>();
    const items: ScreenGroupLayoutItem[] = [];

    for (const rawItem of rawItems) {
      if (!rawItem || typeof rawItem !== 'object') {
        throw new BadRequestException('layout item must be an object');
      }

      const item = rawItem as Record<string, unknown>;
      const deviceId = typeof item.device_id === 'string' ? item.device_id.trim() : '';
      const displayId = typeof item.display_id === 'string' ? item.display_id.trim() : '';
      const x = Number(item.x);
      const y = Number(item.y);
      const width = Number(item.width);
      const height = Number(item.height);

      if (!deviceId || !displayId) {
        throw new BadRequestException('layout item must include device_id and display_id');
      }

      if (![x, y, width, height].every((value) => Number.isFinite(value))) {
        throw new BadRequestException('layout item coordinates must be finite numbers');
      }

      const key = `${deviceId}:${displayId}`;
      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      items.push({
        device_id: deviceId,
        display_id: displayId,
        x: Math.round(x),
        y: Math.round(y),
        width: Math.max(0, Math.round(width)),
        height: Math.max(0, Math.round(height)),
      });
    }

    return items;
  }

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

  @Put(':groupId/layout')
  async updateLayout(
    @Param('zoneId') zoneId: string,
    @Param('groupId') groupId: string,
    @Body() body: { items?: unknown },
  ) {
    const group = await this.repo.findOne({ where: { group_id: groupId, zone_id: zoneId } });
    if (!group) {
      throw new NotFoundException('Screen group not found');
    }

    group.layout_items = this.normalizeLayoutItems(body?.items ?? []);
    const updatedGroup = await this.repo.save(group);

    this.auditClient.append({
      event_type: 'group.layout.updated',
      actor_type: 'system',
      actor_id: 'zone-policy-service',
      zone_id: zoneId,
      resource_type: 'screen_group',
      resource_id: groupId,
      action: 'group_layout_updated',
      detail: { item_count: updatedGroup.layout_items.length },
    });

    return updatedGroup;
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
