import { BadRequestException } from '@nestjs/common';
import csv from 'csv-parse';
import { validateSync } from 'class-validator';

export class Csv {
  static parseFile<T>(file: Express.Multer.File) {
    return new Promise<T[]>((resolve, reject) => {
      csv.parse(
        file.buffer,
        {
          columns: true,
          relax_quotes: true,
          skip_empty_lines: true,
          cast: true,
        },
        (err, records: T[]) => {
          if (err) {
            reject(err);
          }

          resolve(records);
        },
      );
    });
  }

  static validateRows<T extends object>(rows: T[]) {
    const validRows: T[] = [];
    const errors: string[] = [];
    let index = 1;

    return new Promise<T[]>((resolve, reject) => {
      for (const row of rows) {
        const validationErrors = validateSync(row);

        if (validationErrors.length > 0) {
          const errorMessage =
            `line ${index}: ` +
            validationErrors
              .map((validationError) =>
                Object.values(validationError.constraints!).join(', '),
              )
              .join(', ');

          index += 1;

          errors.push(errorMessage);
        }

        validRows.push(row);
      }

      if (errors.length > 0) {
        reject(new BadRequestException(errors));
      }

      resolve(validRows);
    });
  }
}
