import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsString, IsNotEmpty, MaxLength, IsEmail } from 'class-validator';
import { Organization } from 'src/modules/organizations/entities/organization.entity';
import { Exclude } from 'class-transformer';
import Role from 'src/common/role.enum';
import { uuidv7 } from 'uuidv7';

@Entity()
export class User {
  @PrimaryColumn()
  id: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  @MaxLength(255, { message: 'given name cannot exceed 255 characters' })
  givenName: string;

  @Column({ nullable: true })
  @IsString()
  @MaxLength(255, { message: 'family name cannot exceed 255 characters' })
  familyName?: string;

  @Column({ unique: true })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255, { message: 'email cannot exceed 255 characters' })
  email: string;

  @Column()
  @IsNotEmpty()
  password: string;

  @Column({
    nullable: true,
  })
  @Exclude()
  public currentHashedRefreshToken?: string;

  @Column({ nullable: true })
  public twoFactorAuthenticationSecret?: string;

  @Column({ default: false })
  public isTwoFactorAuthenticationEnabled: boolean;

  @Column({
    type: 'enum',
    enum: Role,
    nullable: true,
  })
  role?: string;

  @ManyToOne(() => Organization, (organization) => organization.id, {
    nullable: true,
    lazy: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  organization: Organization;

  @CreateDateColumn()
  createdOn: Date;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: true,
    lazy: true,
  })
  createdBy: User;

  @UpdateDateColumn()
  updatedOn: Date;

  @ManyToOne(() => User, (user) => user.id, {
    nullable: true,
    lazy: true,
  })
  updatedBy: User;

  @Column({ nullable: true })
  @DeleteDateColumn()
  voidedOn?: Date;

  @BeforeInsert() private beforeInsert() {
    this.id = uuidv7();
  }
}
