import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom, catchError } from 'rxjs';
import { ExpenseDTO } from 'src/expenses/expenses.dto';

@Injectable()
export class ModelsService {
  constructor(private readonly httpService: HttpService) {}

  async predict(
    expenses: ExpenseDTO[],
  ): Promise<[null, ExpenseDTO[]] | [Error, null]> {
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<ExpenseDTO[]>('/model/predict', expenses).pipe(
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
