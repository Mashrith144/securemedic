import { IsDateString } from 'class-validator';
import { User } from './user.entity';
import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, OneToOne } from 'typeorm';

@Entity()
export class Session extends BaseEntity {
  @OneToOne(() => User, { eager: true })
  userId: string;

  @IsDateString()
  @Column()
  expiresOn: Date;

  constructor(userId: string, expiresOn: Date) {
    super();
    this.userId = userId;
    this.expiresOn = expiresOn;
  }
}
