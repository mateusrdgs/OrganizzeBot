import { HttpModule } from '@nestjs/axios';
import { Test, TestingModule } from '@nestjs/testing';
import { ModelsService } from './models.service';

describe('ModelsService', () => {
  let service: ModelsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        HttpModule.register({
          baseURL: 'http://localhost:8000',
        }),
      ],
      providers: [ModelsService],
    }).compile();

    service = module.get<ModelsService>(ModelsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
