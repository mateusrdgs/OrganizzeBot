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

import { ModelsService } from './models.service';

@Controller('models')
export class ModelsController {
  constructor(private modelsService: ModelsService) {}

  @Post('train')
  @HttpCode(200)
  @UseInterceptors(ClassSerializerInterceptor, FileInterceptor('file'))
  async trainModel(
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
      const [error] = await this.modelsService.train(file);

      if (error) {
        throw error;
      }

      return;
    }

    throw new BadRequestException();
  }
}
