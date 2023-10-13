import { Test, TestingModule } from '@nestjs/testing';
import { FhirController } from './fhir.controller';
import { FhirService } from './fhir.service';

describe('FhirController', () => {
  let controller: FhirController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FhirController],
      providers: [FhirService],
    }).compile();

    controller = module.get<FhirController>(FhirController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
