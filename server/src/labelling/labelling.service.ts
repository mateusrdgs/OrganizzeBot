import { Injectable } from '@nestjs/common';
import csv from 'csv-parse';

import { ExpenseDTO } from 'src/labelling/labelling.dtos';

@Injectable()
export class LabellingService {
  async validateExpensesFile(file: Express.Multer.File) {
    try {
      await this.parseCSVFile(file);
    } catch (ex: csv.CsvError) {
      return ex;
    }
  }

  private parseCSVFile(file: Express.Multer.File) {
    return new Promise<ExpenseDTO[]>((resolve, reject) => {
      csv.parse(
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument
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
