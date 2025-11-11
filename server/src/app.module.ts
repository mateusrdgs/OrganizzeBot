import { Module } from '@nestjs/common';
import { LabellingModule } from './labelling/labelling.module';

@Module({
  imports: [LabellingModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
