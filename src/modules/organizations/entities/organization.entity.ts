import { IsBoolean, IsNotEmpty, IsString, IsUrl } from 'class-validator';
import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Organization extends BaseEntity {
  @Column()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Column({ unique: true })
  @IsUrl()
  @IsNotEmpty()
  domain: string;

  @Column()
  @IsBoolean()
  @IsNotEmpty()
  isActive: boolean;

  @Column()
  @IsString()
  description: string;
}
