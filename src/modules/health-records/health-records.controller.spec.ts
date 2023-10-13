import { Test, TestingModule } from '@nestjs/testing';
import { HealthRecordsController } from './health-records.controller';
import { HealthRecordsService } from './health-records.service';

describe('HealthRecordsController', () => {
  let controller: HealthRecordsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthRecordsController],
      providers: [HealthRecordsService],
    }).compile();

    controller = module.get<HealthRecordsController>(HealthRecordsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
