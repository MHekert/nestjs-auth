import { BaseEntity, Column, Entity, PrimaryColumn } from 'typeorm';
import { UserSourceEnum } from '../../common/enums/user-source.enum';

@Entity()
export class User extends BaseEntity {
  @PrimaryColumn()
  id: string;

  @PrimaryColumn({ type: 'enum', enum: UserSourceEnum })
  source: UserSourceEnum;

  @Column()
  email: string;
}
