import { Module } from '@nestjs/common';
import { BoardsService } from './boards.service';
import { BoardsController } from './boards.controller';
import { BoardsGateway } from './boards.gateway';

@Module({
  controllers: [BoardsController],
  providers: [BoardsService, BoardsGateway],
  exports: [BoardsGateway],
})
export class BoardsModule {}
