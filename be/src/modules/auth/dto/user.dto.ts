import { Expose } from 'class-transformer';
import { UserSourceEnum } from '../../../common/enums/user-source.enum';

export class UserDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  source: UserSourceEnum;
}
