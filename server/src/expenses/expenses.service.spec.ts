import { Test, TestingModule } from '@nestjs/testing';
import * as fs from 'fs';

import { ExpensesService } from './expenses.service';
import { ModelsModule } from 'src/models/models.module';

const mockFile = {
  fieldname: 'file',
  originalname: 'expenses.csv',
  encoding: '7bit',
  mimetype: 'text/csv',
  buffer: fs.readFileSync(
    __dirname + '/__mocks__/expenses.csv',
    'utf-8',
  ) as unknown as Buffer,
  size: 51828,
} as Express.Multer.File;

describe('ExpensesService', () => {
  let service: ExpensesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ModelsModule],
      providers: [ExpensesService],
    }).compile();

    service = module.get<ExpensesService>(ExpensesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the correct response', async () => {
    jest.spyOn(service, 'predictExpenses').mockImplementation(
      () =>
        new Promise((resolve) => {
          resolve([
            null,
            [
              { date: '2025-09-08', title: 'Expense 1', amount: 88.33 },
              { date: '2025-09-08', title: 'Expense 2', amount: 45.57 },
              { date: '2025-09-08', title: 'Expense 3', amount: 12.91 },
            ],
          ]);
        }),
    );

    expect(await service.predictExpenses(mockFile)).toEqual([
      null,
      [
        { date: '2025-09-08', title: 'Expense 1', amount: 88.33 },
        { date: '2025-09-08', title: 'Expense 2', amount: 45.57 },
        { date: '2025-09-08', title: 'Expense 3', amount: 12.91 },
      ],
    ]);
  });
});
