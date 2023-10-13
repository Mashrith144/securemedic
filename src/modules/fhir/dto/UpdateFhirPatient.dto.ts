import { PartialType } from '@nestjs/mapped-types';
import { CreateFhirPatientDto } from './CreateFhirPatient.dto';

export class UpdateFhirPatientDto extends PartialType(CreateFhirPatientDto) {}
