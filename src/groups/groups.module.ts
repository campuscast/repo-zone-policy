import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScreenGroup } from './screen-group.entity';
@Module({ imports: [TypeOrmModule.forFeature([ScreenGroup])], exports: [TypeOrmModule] })
export class GroupsModule {}
