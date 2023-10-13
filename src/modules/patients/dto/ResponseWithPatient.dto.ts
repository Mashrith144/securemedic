import { Patient } from '../entities/patient.entity';

export class ResponseWithPatient {
  id: string;
  givenName: string;
  familyName: string;
  dateOfBirth: Date;
  heightCms: number;
  weightKgs: number;
  nationality: string;
  language: string;
  email: string;
  phone: string;
  address: string;

  constructor(patient: Patient) {
    this.id = patient.id;
    this.givenName = patient.givenName;
    this.familyName = patient.familyName;
    this.dateOfBirth = patient.dateOfBirth;
    this.heightCms = patient.heightCms;
    this.weightKgs = patient.weightKgs;
    this.nationality = patient.nationality;
    this.language = patient.language;
    this.email = patient.email;
    this.phone = patient.phone;
    this.address = patient.address;
  }
}
