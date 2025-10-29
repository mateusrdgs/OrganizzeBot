import { IsNotEmpty, IsString } from 'class-validator';

export class ExpenseDTO {
  @IsNotEmpty()
  @IsString()
  date: string;

  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  amount: string;
}
