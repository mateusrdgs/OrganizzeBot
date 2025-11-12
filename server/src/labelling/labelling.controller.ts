import {
  HttpCode,
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  ClassSerializerInterceptor,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { LabellingService } from './labelling.service';

@Controller('labelling')
export class LabellingController {
  constructor(private labellingService: LabellingService) {}
  @Post('')
  @HttpCode(200)
  @UseInterceptors(ClassSerializerInterceptor, FileInterceptor('file'))
  async parseExpenses(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 100000 }),
          new FileTypeValidator({
            fileType: 'text/csv',
            skipMagicNumbersValidation: true,
          }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
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
