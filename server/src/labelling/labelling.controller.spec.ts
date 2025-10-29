import { Test, TestingModule } from '@nestjs/testing';
import { LabellingController } from './labelling.controller';

describe('LabellingController', () => {
  let controller: LabellingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LabellingController],
    }).compile();

    controller = module.get<LabellingController>(LabellingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
