import { Module } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { PatientsController } from './patients.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Patient } from './entities/patient.entity';
import { PatientAccess } from './entities/patientAccess.entity';
import { User } from '../auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Patient, PatientAccess, User])],
  controllers: [PatientsController],
  providers: [PatientsService],
})
export class PatientsModule {}
