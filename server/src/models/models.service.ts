import {
  HttpException,
  Logger,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError } from 'rxjs';
import {
  PredictExpenseDTO,
  ExpensesForTrainingDTO,
} from 'src/shared/dtos/expenses.dto';
import { Expense } from 'src/shared/entities/expenses.entities';

import { Csv } from 'src/shared/utils/csv';
import { CsvError } from 'csv-parse';
import { AxiosError } from 'axios';

@Injectable()
export class ModelsService {
  private readonly logger = new Logger(ModelsService.name);

  constructor(private readonly httpService: HttpService) {}

  async predict(
    expenses: PredictExpenseDTO[],
  ): Promise<[null, Expense[]] | [Error, null]> {
    try {
      this.logger.log('Calling endpoint for prediction');

      const { data } = await firstValueFrom(
        this.httpService.post<Expense[]>('/model/predict', expenses).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.message);

            throw new InternalServerErrorException();
          }),
        ),
      );

      return [null, data];
    } catch (ex: unknown) {
      return [ex as HttpException, null];
    }
  }

  private async parseExpenses(
    file: Express.Multer.File,
  ): Promise<[null, ExpensesForTrainingDTO[]] | [Error, null]> {
    try {
      this.logger.log('Starting file parsing');

      const rows = (await Csv.parseFile<ExpensesForTrainingDTO>(file)).map(
        (row) =>
          new ExpensesForTrainingDTO(
            row.date,
            row.title,
            row.amount,
            row.category,
          ),
      );

      this.logger.log('File parsed successfully');

      this.logger.log('Starting rows validation');

      await Csv.validateRows(rows);

      this.logger.log('Rows validated successfully');

      return [null, rows];
    } catch (ex: unknown) {
      this.logger.log('Error parsing CSV file', ex);

      return [ex as CsvError | HttpException, null];
    }
  }

  private async trainModel(
    expenses: ExpensesForTrainingDTO[],
  ): Promise<[null, null] | [Error, null]> {
    try {
      this.logger.log('Calling endpoint for training');

      await firstValueFrom(
        this.httpService.post('/model/train', expenses).pipe(
          catchError((error: AxiosError) => {
            this.logger.error(error.message);

            throw new InternalServerErrorException();
          }),
        ),
      );

      this.logger.log('Model trained successfully');

      return [null, null];
    } catch (ex: unknown) {
      return [ex as HttpException, null];
    }
  }

  async train(
    file: Express.Multer.File,
  ): Promise<[null, null] | [Error, null]> {
    this.logger.log('Starting model training');

    const [parseError, expenses] = await this.parseExpenses(file);

    if (parseError) {
      return [parseError, null];
    }

    this.logger.log('Successfully parsed CSV file');

    const [trainingError] = await this.trainModel(expenses);

    if (trainingError) {
      return [trainingError, null];
    }

    return [null, null];
  }
}
