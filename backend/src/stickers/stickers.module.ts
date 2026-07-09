import { Module } from '@nestjs/common';
import { BoardsModule } from '@/boards/boards.module';
import { StickersController } from './stickers.controller';
import { StickersService } from './stickers.service';

@Module({
  imports: [BoardsModule],
  controllers: [StickersController],
  providers: [StickersService],
})
export class StickersModule {}
