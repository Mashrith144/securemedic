import { Module } from '@nestjs/common';
import { HealthRecordsService } from './health-records.service';
import { HealthRecordsController } from './health-records.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthRecord } from './entities/HealthRecord.entity';
import { PatientsService } from '../patients/patients.service';
import { Patient } from '../patients/entities/patient.entity';
import { PatientAccess } from '../patients/entities/patientAccess.entity';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HealthRecord, Patient, PatientAccess, User]),
  ],
  controllers: [HealthRecordsController],
  providers: [HealthRecordsService, PatientsService],
})
export class HealthRecordsModule {}
