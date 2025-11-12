import { Module } from '@nestjs/common';
import { ModelsService } from './models.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [
    HttpModule.register({
      baseURL: 'http://localhost:8000',
    }),
  ],
  providers: [ModelsService],
  exports: [ModelsService],
})
export class ModelsModule {}
