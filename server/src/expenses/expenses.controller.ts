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

import { ExpensesService } from './expenses.service';
import { ModelsService } from 'src/models/models.service';

@Controller('expenses')
export class ExpensesController {
  constructor(
    private expensesService: ExpensesService,
    private modelsService: ModelsService,
  ) {}

  @Post('predict')
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
      const [error, expenses] = await this.expensesService.parseExpenses(file);

      if (error) {
        throw error;
      }

      const [predictionError, prediction] =
        await this.modelsService.predict(expenses);

      if (predictionError) {
        throw predictionError;
      }

      return prediction;
    }

    throw new BadRequestException();
  }
}
