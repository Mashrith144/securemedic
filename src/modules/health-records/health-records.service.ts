import { BadRequestException, Injectable, HttpStatus } from '@nestjs/common';
import { CreateHealthRecordDto } from './dto/CreateHealthRecord.dto';
import { UpdateHealthRecordDto } from './dto/UpdateHealthRecord.dto';
import { User } from '../auth/entities/user.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { HealthRecord } from './entities/HealthRecord.entity';
import { PatientsService } from '../patients/patients.service';
import { Patient } from '../patients/entities/patient.entity';

@Injectable()
export class HealthRecordsService {
  constructor(
    @InjectRepository(HealthRecord)
    private healthRecordsRepository: Repository<HealthRecord>,

    private dataSource: DataSource,

    private readonly patientService: PatientsService,
  ) {}

  async create(
    createHealthRecordDto: CreateHealthRecordDto,
    requester: User,
  ): Promise<HealthRecord> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Check whether the patient with the id exists and the requester has access to the patient
      const patient: Patient = await this.patientService.findOne(
        createHealthRecordDto.patientId,
        requester,
      );

      const newHealthRecord = this.healthRecordsRepository.create(
        createHealthRecordDto,
      );

      newHealthRecord.patient = patient;
      newHealthRecord.createdBy = requester;
      newHealthRecord.updatedBy = requester;

      await queryRunner.manager.save(newHealthRecord);
      await queryRunner.commitTransaction();

      return newHealthRecord;
    } catch (error) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  findAll() {
    return `This action returns all healthRecords`;
  }

  async findOne(id: string, requester: User) {
    try {
      const existingHealthRecord =
        await this.healthRecordsRepository.findOneByOrFail({ id });

      // If it does, check whether the user has access to the patient to whom the health record belongs to
      const existingHealthRecordPatient = await existingHealthRecord.patient;
      await this.patientService.findOne(
        existingHealthRecordPatient.id,
        requester,
      );

      // If no errors are thrown by this point, the user can safely access the health record
      return existingHealthRecord;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(
    id: string,
    updateHealthRecordDto: UpdateHealthRecordDto,
    requester: User,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Check whether a health record with the given id exists
      let existingHealthRecord =
        await this.healthRecordsRepository.findOneByOrFail({ id });

      // If it does, check whether the user has access to the patient to whom the health record belongs to
      const existingHealthRecordPatient = await existingHealthRecord.patient;
      await this.patientService.findOne(
        existingHealthRecordPatient.id,
        requester,
      );

      // If these two checks are passing, we can safely update the health record
      await queryRunner.manager.update(
        HealthRecord,
        { id },
        { ...updateHealthRecordDto, updatedBy: requester },
      );

      await queryRunner.commitTransaction();

      existingHealthRecord = await this.healthRecordsRepository.findOneByOrFail(
        { id },
      );

      return existingHealthRecord;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string, requester: User): Promise<HttpStatus> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Check whether a health record with the given id exists
      const existingHealthRecord =
        await this.healthRecordsRepository.findOneByOrFail({ id });

      // If it does, check whether the user has access to the patient to whom the health record belongs to
      const existingHealthRecordPatient = await existingHealthRecord.patient;
      await this.patientService.findOne(
        existingHealthRecordPatient.id,
        requester,
      );

      // If these two checks are passing, we can safely delete the health record
      await queryRunner.manager.delete(HealthRecord, { id });

      await queryRunner.commitTransaction();
      return HttpStatus.OK;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      await queryRunner.release();
    }
  }
}
