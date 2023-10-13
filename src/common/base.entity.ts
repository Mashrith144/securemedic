import { User } from 'src/modules/auth/entities/user.entity';
import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { uuidv7 } from 'uuidv7';

export class BaseEntity {
  @PrimaryColumn()
  id: string;

  @CreateDateColumn()
  createdOn: Date;

  @ManyToOne(() => User, (user) => user.id, {
    eager: true,
  })
  @JoinColumn()
  createdBy: User;

  @UpdateDateColumn()
  updatedOn: Date;

  @ManyToOne(() => User, (user) => user.id, {
    eager: true,
  })
  @JoinColumn()
  updatedBy: User;

  @Column({ nullable: true })
  @DeleteDateColumn()
  voidedOn?: Date;

  @BeforeInsert() private beforeInsert() {
    this.id = uuidv7();
  }
}
