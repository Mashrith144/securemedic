import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateFhirPatientDto } from './dto/CreateFhirPatient.dto';
import { UpdateFhirPatientDto } from './dto/UpdateFhirPatient.dto';
import { PatientDTO } from 'akinox-fhir-sdk';
import { PatientsService } from '../patients/patients.service';
import { Patient } from '../patients/entities/patient.entity';
import { User } from '../auth/entities/user.entity';
import { CreatePatientDto } from '../patients/dto/CreatePatient.dto';
import { UpdatePatientDto } from '../patients/dto/UpdatePatient.dto';

@Injectable()
export class FhirService {
  constructor(private readonly patientsService: PatientsService) {}

  transformPatientToFHIRPatient = (patient: Patient): PatientDTO => {
    const fhirPatient = new PatientDTO();

    // Set id
    fhirPatient.id = patient.id;

    // Set name
    fhirPatient.name = [
      {
        given: [patient.givenName],
        family: patient?.familyName,
      },
    ];

    // Set birthday
    fhirPatient.birthDate = patient.dateOfBirth?.toDateString();

    // Set patient address. Assume that it is of type 'home'.
    fhirPatient.address = [{ text: patient?.address, use: 'home' }];

    // Set language
    fhirPatient.language = patient?.language;

    // Set telecom
    fhirPatient.telecom = [
      { system: 'email', value: patient.email },
      { system: 'phone', value: patient?.phone },
    ];

    return fhirPatient;
  };

  async createFHIRPatient(
    createFhirPatientDto: CreateFhirPatientDto,
    requester: User,
  ): Promise<PatientDTO> {
    try {
      const createPatientDto: CreatePatientDto = new CreatePatientDto(
        createFhirPatientDto?.name[0]?.given[0],
        createFhirPatientDto?.birthDate,
        createFhirPatientDto?.telecom?.find(
          (telecom) => telecom.system === 'email',
        )?.value,
        createFhirPatientDto?.name[0]?.family,
        null,
        null,
        null,
        createFhirPatientDto?.language,
        createFhirPatientDto?.telecom?.find(
          (telecom) => telecom.system === 'phone',
        ).value,
        createFhirPatientDto?.address[0]?.text,
      );

      const patient: Patient = await this.patientsService.create(
        createPatientDto,
        requester,
      );

      return this.transformPatientToFHIRPatient(patient);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async getFHIRPatient(id: string, requester: User): Promise<PatientDTO> {
    try {
      const patient: Patient = await this.patientsService.findOne(
        id,
        requester,
      );

      return this.transformPatientToFHIRPatient(patient);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updateFhirPatient(
    id: string,
    updateFhirPatientDto: UpdateFhirPatientDto,
    requester: User,
  ) {
    try {
      console.table({
        given: updateFhirPatientDto?.name[0]?.given[0],
        fam: updateFhirPatientDto?.name[0]?.family,
      });
      const updatePatientDto: UpdatePatientDto = new UpdatePatientDto(
        updateFhirPatientDto?.name?.[0]?.given[0] || undefined,
        updateFhirPatientDto?.birthDate || undefined,
        updateFhirPatientDto?.telecom?.find(
          (telecom) => telecom.system === 'email',
        )?.value || undefined,
        updateFhirPatientDto?.name?.[0]?.family || undefined,
        null,
        null,
        null,
        updateFhirPatientDto?.language || undefined,
        updateFhirPatientDto?.telecom?.find(
          (telecom) => telecom.system === 'phone',
        ).value || undefined,
        updateFhirPatientDto?.address?.[0]?.text || undefined,
      );

      const patient: Patient = await this.patientsService.update(
        id,
        updatePatientDto,
        requester,
      );

      return this.transformPatientToFHIRPatient(patient);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
}
