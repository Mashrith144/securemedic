export class CreateHealthRecordDto {
  patientId: string;
  diagnosis: string;
  prescription?: string;
  comments?: string;
}
