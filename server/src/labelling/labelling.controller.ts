import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { LabellingService } from 'src/labelling/labelling.service';

@Controller('labelling')
export class LabellingController {
  constructor(private labellingService: LabellingService) {}
  @Post('')
  @UseInterceptors(FileInterceptor('file'))
  async labelling(@UploadedFile() file: Express.Multer.File) {
    const [error, expenses] = await this.labellingService.processExpenses(file);

    if (error) {
      return error;
    }

    return expenses;
  }
}
