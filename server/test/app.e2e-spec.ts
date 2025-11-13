import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppModule } from '../src/app.module';
import { ExpensesService } from 'src/expenses/expenses.service';
import { ModelsService } from 'src/models/models.service';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  const expensesService = {
    predictExpenses: () => {
      return [
        null,
        [
          {
            date: '2025-09-08',
            title: 'Expense 1',
            amount: 88.33,
            category: 'Other',
          },
          {
            date: '2025-09-08',
            title: 'Expense 2',
            amount: 45.57,
            category: 'Other',
          },
          {
            date: '2025-09-08',
            title: 'Expense 3',
            amount: 12.91,
            category: 'Other',
          },
        ],
      ];
    },
  };

  const modelsService = {
    train: () => {
      return [null];
    },
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(ExpensesService)
      .useValue(expensesService)
      .overrideProvider(ModelsService)
      .useValue(modelsService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  describe('/expenses', () => {
    it('/expenses/predict (POST)', () => {
      return request(app.getHttpServer())
        .post('/expenses/predict')
        .attach('file', `${__dirname}/__mocks__/expenses.csv`)
        .expect(200);
    });
  });

  describe('/models', () => {
    it('/models/train (POST)', () => {
      return request(app.getHttpServer())
        .post('/models/train')
        .attach('file', `${__dirname}/__mocks__/expenses.csv`)
        .expect(200);
    });
  });
});
