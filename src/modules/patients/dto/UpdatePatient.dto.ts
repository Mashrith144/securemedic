export class UpdatePatientDto {
  givenName?: string;
  dateOfBirth?: Date;
  email?: string;
  familyName?: string;
  heightCms?: number;
  weightKgs?: number;
  nationality?: string;
  language?: string;
  phone?: string;
  address?: string;

  constructor(
    givenName?: string,
    dateOfBirth?: string,
    email?: string,
    familyName?: string,
    heightCms?: number,
    weightKgs?: number,
    nationality?: string,
    language?: string,
    phone?: string,
    address?: string,
  ) {
    this.givenName = givenName;
    this.familyName = familyName;
    this.dateOfBirth = new Date(dateOfBirth);
    this.heightCms = heightCms;
    this.weightKgs = weightKgs;
    this.nationality = nationality;
    this.language = language;
    this.email = email;
    this.phone = phone;
    this.address = address;
  }
}
