import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError } from 'rxjs';
import { PredictExpenseDTO } from 'src/shared/dtos/expenses.dto';
import { Expense } from 'src/shared/entities/expenses.entities';

@Injectable()
export class ModelsService {
  constructor(private readonly httpService: HttpService) {}

  async predict(
    expenses: PredictExpenseDTO[],
  ): Promise<[null, Expense[]] | [Error, null]> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<Expense[]>('/model/predict', expenses).pipe(
          catchError(() => {
            throw new InternalServerErrorException();
          }),
        ),
      );

      return [null, data];
    } catch {
      return [new Error(), null];
    }
  }
}
