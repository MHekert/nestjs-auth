import { EntityRepository, Repository } from 'typeorm';
import { UserSourceEnum } from '../../common/enums/user-source.enum';
import { User } from '../entities/user.entity';

@EntityRepository(User)
export class UserRepository extends Repository<User> {
  async addUser(
    id: string,
    email: string | undefined,
    source: UserSourceEnum,
  ): Promise<User> {
    return this.create({
      id,
      email,
      source,
    }).save();
  }
}
