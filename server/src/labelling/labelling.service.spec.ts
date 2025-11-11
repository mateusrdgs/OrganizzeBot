import { Test, TestingModule } from '@nestjs/testing';
import { LabellingService } from './labelling.service';
import * as fs from 'fs';

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

describe('LabellingService', () => {
  let service: LabellingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LabellingService],
    }).compile();

    service = module.get<LabellingService>(LabellingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return the correct response', async () => {
    expect(await service.processExpenses(mockFile)).toEqual([
      null,
      [
        { date: '2025-09-08', title: 'Expense 1', amount: 88.33 },
        { date: '2025-09-08', title: 'Expense 2', amount: 45.57 },
        { date: '2025-09-08', title: 'Expense 3', amount: 12.91 },
      ],
    ]);
  });
});
