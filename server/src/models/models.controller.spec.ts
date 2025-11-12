import { Test, TestingModule } from '@nestjs/testing';
import { HttpModule } from '@nestjs/axios';
import { ModelsController } from './models.controller';
import { ModelsService } from './models.service';

describe('ExpensesController', () => {
  let controller: ModelsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule.register({
          baseURL: 'http://localhost:8000',
        }),
      ],
      controllers: [ModelsController],
      providers: [ModelsService],
    }).compile();

    controller = module.get<ModelsController>(ModelsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
