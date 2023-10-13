import { IsDateString, IsEmail, IsNumber, IsString } from 'class-validator';
import { BaseEntity } from 'src/common/base.entity';
import { Organization } from 'src/modules/organizations/entities/organization.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity()
export class Patient extends BaseEntity {
  @Column()
  @IsString()
  givenName: string;

  @Column({ nullable: true })
  @IsString()
  familyName?: string;

  @Column({ nullable: true })
  @IsDateString()
  dateOfBirth: Date;

  @Column({ nullable: true })
  @IsNumber()
  heightCms?: number;

  @Column({ nullable: true })
  @IsNumber()
  weightKgs?: number;

  @Column({ nullable: true })
  @IsString()
  nationality?: string;

  @Column({ nullable: true })
  @IsString()
  language?: string;

  @Column()
  @IsEmail()
  email: string;

  @Column({ nullable: true })
  @IsString()
  phone?: string;

  @Column({ nullable: true })
  @IsString()
  address?: string;

  @ManyToOne(() => Organization, (organization) => organization.id, {
    nullable: true,
    lazy: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  organization: Organization;
}
