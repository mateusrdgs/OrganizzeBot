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
  index(@UploadedFile() file: Express.Multer.File) {
    this.labellingService.validateExpensesFile(file);
  }
}
