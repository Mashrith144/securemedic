import { Module } from '@nestjs/common';
import { FhirService } from './fhir.service';
import { FhirController } from './fhir.controller';
import { PatientsService } from '../patients/patients.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from '../patients/entities/patient.entity';
import { PatientAccess } from '../patients/entities/patientAccess.entity';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, PatientAccess, User])],
  controllers: [FhirController],
  providers: [FhirService, PatientsService],
})
export class FhirModule {}
