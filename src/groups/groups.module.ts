import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScreenGroup } from './screen-group.entity';
import { GroupsController } from './groups.controller';
@Module({
  imports: [TypeOrmModule.forFeature([ScreenGroup])],
  controllers: [GroupsController],
  exports: [TypeOrmModule],
})
export class GroupsModule {}
