import { HealthRecord } from '../entities/HealthRecord.entity';

export class ResponseWithHealthRecord {
  id: string;
  patientId: string;
  diagnosis: string;
  prescription: string;
  comments: string;

  constructor(healthRecord: HealthRecord, patientId: string) {
    this.id = healthRecord.id;
    this.patientId = patientId;
    this.diagnosis = healthRecord.diagnosis;
    this.prescription = healthRecord.prescription;
    this.comments = healthRecord.comments;
  }
}
