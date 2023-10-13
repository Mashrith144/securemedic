import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity } from 'typeorm';
import { IsString } from 'class-validator';

@Entity()
export class PatientAccess extends BaseEntity {
  @Column()
  @IsString()
  patientId: string;

  @Column()
  @IsString()
  userId: string;
}
