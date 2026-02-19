import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Zone } from './zone.entity';

@Injectable()
export class ZonesService {
  constructor(@InjectRepository(Zone) private repo: Repository<Zone>) {}

  findAll(page: number, pageSize: number) {
    return this.repo.findAndCount({ skip: (page - 1) * pageSize, take: pageSize, relations: ['groups'] });
  }

  findOne(zoneId: string) {
    return this.repo.findOne({ where: { zone_id: zoneId }, relations: ['groups'] });
  }

  create(data: Partial<Zone>) {
    return this.repo.save(this.repo.create(data));
  }
}
