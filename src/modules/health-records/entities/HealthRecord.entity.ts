import { BaseEntity } from 'src/common/base.entity';
import { Patient } from 'src/modules/patients/entities/patient.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class HealthRecord extends BaseEntity {
  @ManyToOne(() => Patient, (patient) => patient.id, {
    lazy: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  patient: Patient;

  @Column()
  diagnosis: string;

  @Column({ nullable: true })
  prescription?: string;

  @Column({ nullable: true })
  comments?: string;
}
