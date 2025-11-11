import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { LabellingService } from './labelling.service';

@Controller('labelling')
export class LabellingController {
  constructor(private labellingService: LabellingService) {}
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async labelling(@UploadedFile() file: Express.Multer.File) {
    if (file) {
      const [error, expenses] =
        await this.labellingService.processExpenses(file);

      if (error) {
        throw error;
      }

      return expenses;
    }

    throw new BadRequestException();
  }
}
