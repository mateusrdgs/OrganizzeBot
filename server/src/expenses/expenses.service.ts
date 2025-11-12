import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { validateSync } from 'class-validator';
import csv, { CsvError } from 'csv-parse';

import { PredictExpenseDTO } from 'src/shared/dtos/expenses.dto';

@Injectable()
export class ExpensesService {
  async parseExpenses(
    file: Express.Multer.File,
  ): Promise<[null, PredictExpenseDTO[]] | [Error, null]> {
    try {
      const expenses = await this.parseCSVFile(file);
      return [null, expenses];
    } catch (ex: unknown) {
      return [ex as CsvError | HttpException, null];
    }
  }

  private parseCSVFile(file: Express.Multer.File) {
    return new Promise<PredictExpenseDTO[]>((resolve, reject) => {
      csv.parse(
        file.buffer,
        {
          columns: true,
          relax_quotes: true,
          skip_empty_lines: true,
          cast: true,
        },
        (err, records: PredictExpenseDTO[]) => {
          if (err) {
            reject(err);
          }

          const expenses: PredictExpenseDTO[] = [];
          const errors: string[] = [];
          let index = 1;

          for (const row of records) {
            const expense = new PredictExpenseDTO(
              row.date,
              row.title,
              row.amount,
            );
            const validationErrors = validateSync(expense);

            if (validationErrors.length > 0) {
              const errorMessage =
                index +
                ' - ' +
                validationErrors
                  .map((validationError) =>
                    Object.values(validationError.constraints!).join(', '),
                  )
                  .join(', ');

              index += 1;

              errors.push(errorMessage);
            }

            expenses.push(expense);
          }

          if (errors.length > 0) {
            reject(new BadRequestException(errors));
          }

          resolve(expenses);
        },
      );
    });
  }
}
