import { Module } from '@nestjs/common';
import { IdeasService } from './ideas.service';
import { IdeasController } from './ideas.controller';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';

@Module({
  controllers: [IdeasController],
  providers: [IdeasService, CloudinaryService],
})
export class IdeasModule {}