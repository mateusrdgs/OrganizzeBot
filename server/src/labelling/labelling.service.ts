import { Injectable } from '@nestjs/common';
import csv, { CsvError } from 'csv-parse';

import { ExpenseDTO } from 'src/labelling/labelling.dtos';

@Injectable()
export class LabellingService {
  async processExpenses(
    file: Express.Multer.File,
  ): Promise<[null, ExpenseDTO[]] | [Error, null]> {
    try {
      const expenses = await this.parseCSVFile(file);
      return [null, expenses];
    } catch (ex: unknown) {
      return [ex as CsvError, null];
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

          resolve(records);
        },
      );
    });
  }
}
