import { Test, TestingModule } from '@nestjs/testing';
import { LabellingService } from './labelling.service';

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
});
