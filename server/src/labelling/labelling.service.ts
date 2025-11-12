import { BadRequestException, HttpException, Injectable } from '@nestjs/common';
import { validateSync } from 'class-validator';
import csv, { CsvError } from 'csv-parse';

import { ExpenseDTO } from 'src/labelling/labelling.dto';

@Injectable()
export class LabellingService {
  async parseExpenses(
    file: Express.Multer.File,
  ): Promise<[null, ExpenseDTO[]] | [Error, null]> {
    try {
      const expenses = await this.parseCSVFile(file);
      return [null, expenses];
    } catch (ex: unknown) {
      return [ex as CsvError | HttpException, null];
    }
  }

  private parseCSVFile(file: Express.Multer.File) {
    return new Promise<ExpenseDTO[]>((resolve, reject) => {
      csv.parse(
        file.buffer,
        {
          columns: true,
          relax_quotes: true,
          skip_empty_lines: true,
          cast: true,
        },
        (err, records: ExpenseDTO[]) => {
          if (err) {
            reject(err);
          }

          const expenses: ExpenseDTO[] = [];
          const errors: string[] = [];
          let index = 1;

          for (const row of records) {
            const expense = new ExpenseDTO(row.date, row.title, row.amount);
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
