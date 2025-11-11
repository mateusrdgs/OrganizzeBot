import { Test, TestingModule } from '@nestjs/testing';
import { LabellingController } from './labelling.controller';
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

describe('LabellingController', () => {
  let controller: LabellingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LabellingController],
      providers: [LabellingService],
    }).compile();

    controller = module.get<LabellingController>(LabellingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return the correct response', async () => {
    expect(await controller.labelling(mockFile)).toEqual([
      { date: '2025-09-08', title: 'Expense 1', amount: 88.33 },
      { date: '2025-09-08', title: 'Expense 2', amount: 45.57 },
      { date: '2025-09-08', title: 'Expense 3', amount: 12.91 },
    ]);
  });
});
