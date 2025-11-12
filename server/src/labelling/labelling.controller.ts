import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { LabellingService } from './labelling.service';

@Controller('labelling')
export class LabellingController {
  constructor(private labellingService: LabellingService) {}
  @Post('')
  @UseInterceptors(ClassSerializerInterceptor, FileInterceptor('file'))
  async parseExpenses(@UploadedFile() file: Express.Multer.File) {
    if (file) {
      const [error, expenses] = await this.labellingService.parseExpenses(file);

      if (error) {
        throw error;
      }

      return expenses;
    }

    throw new BadRequestException();
  }
}
