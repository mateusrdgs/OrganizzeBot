import { HttpException, Injectable } from '@nestjs/common';
import { CsvError } from 'csv-parse';
import { ModelsService } from 'src/models/models.service';

import { PredictExpenseDTO } from 'src/shared/dtos/expenses.dto';

import { Csv } from 'src/shared/utils/csv';

@Injectable()
export class ExpensesService {
  constructor(private modelsService: ModelsService) {}

  private async parseExpenses(
    file: Express.Multer.File,
  ): Promise<[null, PredictExpenseDTO[]] | [Error, null]> {
    try {
      const rows = (await Csv.parseFile<PredictExpenseDTO>(file)).map(
        (row) => new PredictExpenseDTO(row.date, row.title, row.amount),
      );

      await Csv.validateRows(rows);

      return [null, rows];
    } catch (ex: unknown) {
      return [ex as CsvError | HttpException, null];
    }
  }

  async predictExpenses(
    file: Express.Multer.File,
  ): Promise<[null, PredictExpenseDTO[]] | [Error, null]> {
    const [parseError, expenses] = await this.parseExpenses(file);

    if (parseError) {
      return [parseError, null];
    }

    const [predictionError, prediction] =
      await this.modelsService.predict(expenses);

    if (predictionError) {
      return [predictionError, null];
    }

    return [null, prediction];
  }
}
