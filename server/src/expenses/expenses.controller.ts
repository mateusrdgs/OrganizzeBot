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

@Controller('expenses')
export class ExpensesController {
  constructor(private ExpensesService: ExpensesService) {}
  @Post('parse')
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
      const [error, expenses] = await this.ExpensesService.parseExpenses(file);

      if (error) {
        throw error;
      }

      return expenses;
    }

    throw new BadRequestException();
  }
}
