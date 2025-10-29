import { Module } from '@nestjs/common';
import { LabellingController } from './labelling.controller';
import { LabellingService } from './labelling.service';

@Module({
  controllers: [LabellingController],
  providers: [LabellingService],
})
export class LabellingModule {}
