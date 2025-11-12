import { HttpException, Injectable } from '@nestjs/common';
import { CsvError } from 'csv-parse';

import { PredictExpenseDTO } from 'src/shared/dtos/expenses.dto';

import { Csv } from 'src/shared/utils/csv';

@Injectable()
export class ExpensesService {
  async parseExpenses(
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
}
