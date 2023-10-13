import { Test, TestingModule } from '@nestjs/testing';
import { HealthRecordsService } from './health-records.service';

describe('HealthRecordsService', () => {
  let service: HealthRecordsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HealthRecordsService],
    }).compile();

    service = module.get<HealthRecordsService>(HealthRecordsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
