import { Module } from '@nestjs/common';
import { ModelsService } from './models.service';
import { HttpModule } from '@nestjs/axios';
import { ModelsController } from 'src/models/models.controller';

@Module({
  imports: [
    HttpModule.register({
      baseURL: 'http://localhost:8000',
    }),
  ],
  controllers: [ModelsController],
  providers: [ModelsService],
  exports: [ModelsService],
})
export class ModelsModule {}
