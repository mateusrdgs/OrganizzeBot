import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class ExpenseDTO {
  @IsNotEmpty()
  @IsString()
  date: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNumber()
  @Transform(({ value }: { value: number }) => value.toFixed(2), {
    toPlainOnly: true,
  })
  amount: number;

  constructor(date: string, title: string, amount: number) {
    this.date = date;
    this.title = title;
    this.amount = amount;
  }
}
