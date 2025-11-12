import { HttpException, Injectable, Logger } from '@nestjs/common';
import { CsvError } from 'csv-parse';
import { ModelsService } from 'src/models/models.service';

import { PredictExpenseDTO } from 'src/shared/dtos/expenses.dto';

import { Csv } from 'src/shared/utils/csv';

@Injectable()
export class ExpensesService {
  private readonly logger = new Logger(ExpensesService.name);

  constructor(private modelsService: ModelsService) {}

  private async parseExpenses(
    file: Express.Multer.File,
  ): Promise<[null, PredictExpenseDTO[]] | [Error, null]> {
    try {
      this.logger.log('Starting file parsing');

      const rows = (await Csv.parseFile<PredictExpenseDTO>(file)).map(
        (row) => new PredictExpenseDTO(row.date, row.title, row.amount),
      );

      this.logger.log('File parsed successfully');

      this.logger.log('Starting rows validation');

      await Csv.validateRows(rows);

      this.logger.log('Rows validated successfully');

      return [null, rows];
    } catch (ex: unknown) {
      this.logger.error('Error parsing CSV file');

      return [ex as CsvError | HttpException, null];
    }
  }

  async predictExpenses(
    file: Express.Multer.File,
  ): Promise<[null, PredictExpenseDTO[]] | [Error, null]> {
    this.logger.log('Starting expenses prediction');

    const [parseError, expenses] = await this.parseExpenses(file);

    if (parseError) {
      return [parseError, null];
    }

    const [predictionError, prediction] =
      await this.modelsService.predict(expenses);

    if (predictionError) {
      return [predictionError, null];
    }

    this.logger.log('Expenses predicted successfully');

    return [null, prediction];
  }
}
