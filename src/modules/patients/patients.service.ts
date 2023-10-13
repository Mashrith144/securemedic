import {
  BadRequestException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreatePatientDto } from './dto/CreatePatient.dto';
import { UpdatePatientDto } from './dto/UpdatePatient.dto';
import { Patient } from './entities/patient.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { PatientAccess } from './entities/patientAccess.entity';
import Role from 'src/common/role.enum';
import { GrantPatientAccessDto } from './dto/GrantPatientAccess.dto';

@Injectable()
export class PatientsService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>,

    @InjectRepository(PatientAccess)
    private patientAccessRepository: Repository<PatientAccess>,

    @InjectRepository(User)
    private usersRepository: Repository<User>,

    private dataSource: DataSource,
  ) {}

  async canUserAccessPatient(
    userId: string,
    patientId: string,
    patientCreatedById: string,
  ): Promise<boolean> {
    const usersWhoHaveAccessToThePatient = (
      await this.patientAccessRepository.findBy({
        patientId,
      })
    ).map((patientAccess: PatientAccess) => patientAccess.userId);

    return [...usersWhoHaveAccessToThePatient, patientCreatedById].includes(
      userId,
    );
  }

  async create(createPatientDto: CreatePatientDto, requester: User) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Check if a patient with that email exists for the given organization
      // Multiple organizations may have this patient,
      // but each of those organizations can only have one record of that patient
      const requesterOrganization = requester.organization;
      const existingPatient = await this.patientsRepository.findOneBy({
        email: createPatientDto.email,
        organization: {
          id: requesterOrganization.id,
        },
      });

      if (existingPatient) {
        throw new BadRequestException(
          'Patient with the given email id for the organization already exists. Please contact your administrator',
        );
      }

      const newPatient = this.patientsRepository.create(createPatientDto);
      newPatient.createdBy = requester;
      newPatient.updatedBy = requester;
      newPatient.organization = requesterOrganization;

      await queryRunner.manager.save(newPatient);
      await queryRunner.commitTransaction();

      return newPatient;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      queryRunner.release();
    }
  }

  async findOne(id: string, requester: User) {
    try {
      // Check if a patient with that email exists for the given organization
      // Multiple organizations may have this patient,
      // but each of those organizations can only have one record of that patient
      const requesterOrganization = requester.organization;
      const existingPatient = await this.patientsRepository.findOneByOrFail({
        id,
        organization: {
          id: requesterOrganization.id,
        },
      });

      if (
        await this.canUserAccessPatient(
          requester.id,
          existingPatient.id,
          existingPatient.createdBy.id,
        )
      ) {
        return existingPatient;
      } else {
        throw new InternalServerErrorException(
          'You do not have access to this patient',
        );
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async update(
    id: string,
    updatePatientDto: UpdatePatientDto,
    requester: User,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Check if a patient with that email exists for the given organization
      // Multiple organizations may have this patient,
      // but each of those organizations can only have one record of that patient
      const requesterOrganization = requester.organization;
      let existingPatient = await this.patientsRepository.findOneByOrFail({
        id,
        organization: {
          id: requesterOrganization.id,
        },
      });

      if (
        await this.canUserAccessPatient(
          requester.id,
          existingPatient.id,
          existingPatient.createdBy.id,
        )
      ) {
        await queryRunner.manager.update(Patient, existingPatient.id, {
          ...updatePatientDto,
          updatedBy: requester,
        });

        await queryRunner.commitTransaction();

        existingPatient = await this.patientsRepository.findOneByOrFail({
          id,
          organization: {
            id: requesterOrganization.id,
          },
        });

        return existingPatient;
      } else {
        throw new InternalServerErrorException(
          'You do not have access to this patient',
        );
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      queryRunner.release();
    }
  }

  async remove(id: string, requester: User) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Check if a patient with that email exists for the given organization
      // Multiple organizations may have this patient,
      // but each of those organizations can only have one record of that patient
      const requesterOrganization = requester.organization;
      const existingPatient = await this.patientsRepository.findOneByOrFail({
        id,
        organization: {
          id: requesterOrganization.id,
        },
      });

      if (
        await this.canUserAccessPatient(
          requester.id,
          existingPatient.id,
          existingPatient.createdBy.id,
        )
      ) {
        await queryRunner.manager.delete(Patient, {
          id: existingPatient.id,
        });

        await queryRunner.commitTransaction();

        return HttpStatus.OK;
      } else {
        throw new InternalServerErrorException(
          'You do not have access to this patient',
        );
      }
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      queryRunner.release();
    }
  }

  async grantPatientAccess(
    grantPatientAccess: GrantPatientAccessDto,
    requester: User,
  ) {
    try {
      // Check if a patient with that email exists for the given organization
      // Multiple organizations may have this patient,
      // but each of those organizations can only have one record of that patient
      const requesterOrganization = requester.organization;
      await this.patientsRepository.findOneByOrFail({
        id: grantPatientAccess.patientId,
        organization: {
          id: requesterOrganization.id,
        },
        // Only the user who created the patient can grant access to other users
        createdBy: {
          id: requester.id,
        },
      });

      // Check if the user is trying to grant access to himself
      if (grantPatientAccess.userId === requester.id) {
        throw new BadRequestException('You cannot grant access to yourself!');
      }

      // Check if the recipient belongs to the same organization and has the 'User' role
      const existingUser = await this.usersRepository.findOneByOrFail({
        id: grantPatientAccess.userId,
      });

      if (existingUser.organization.id !== requesterOrganization.id) {
        throw new BadRequestException(
          'You cannot grant access to someone outside the organization',
        );
      }

      if (existingUser.role !== Role.User) {
        throw new BadRequestException(
          'You can only grant access to someone with the User role within the organization',
        );
      }

      // Check if the recipient already has excess to this patient
      const patientAccess = await this.patientAccessRepository.findOne({
        where: {
          patientId: grantPatientAccess.patientId,
          userId: grantPatientAccess.userId,
        },
      });

      if (patientAccess) {
        throw new BadRequestException(
          'The user already has access to this patient',
        );
      } else {
        let newPatientAccess = this.patientAccessRepository.create();
        newPatientAccess.patientId = grantPatientAccess.patientId;
        newPatientAccess.userId = grantPatientAccess.userId;
        newPatientAccess.createdBy = requester;
        newPatientAccess.updatedBy = requester;
        newPatientAccess =
          await this.patientAccessRepository.save(newPatientAccess);
        return newPatientAccess;
      }
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
