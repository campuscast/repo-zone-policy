import { Controller, Get, Post, Put, Delete, Param, Query, Body } from '@nestjs/common';
import { ZonesService } from './zones.service';

@Controller('zones')
export class ZonesController {
  constructor(private svc: ZonesService) {}

  @Get()
  async list(@Query('page') page = 1, @Query('page_size') pageSize = 20) {
    const [data, total] = await this.svc.findAll(+page, +pageSize);
    return { data, pagination: { total, page: +page, page_size: +pageSize } };
  }

  @Get(':zoneId')
  async get(@Param('zoneId') zoneId: string) {
    return this.svc.findOne(zoneId);
  }

  @Post()
  async create(@Body() body: { name: string; description?: string }) {
    return this.svc.create(body);
  }

  @Put(':zoneId')
  async update(@Param('zoneId') zoneId: string, @Body() body: { name?: string; description?: string }) {
    return this.svc.update(zoneId, body);
  }

  @Delete(':zoneId')
  async remove(@Param('zoneId') zoneId: string) {
    return this.svc.remove(zoneId);
  }
}
