import { Injectable } from '@nestjs/common';
import { UserSourceEnum } from '../../common/enums/user-source.enum';
import { UserRepository } from '../../data-layer/repositories/user.repository';

@Injectable()
export class UsersService {
  constructor(private userRepository: UserRepository) {}

  async addCognitoUser(id: string, email: string) {
    return this.userRepository.addUser(id, email, UserSourceEnum.Cognito);
  }

  async addAuth0User(id: string, email: string) {
    return this.userRepository.addUser(id, email, UserSourceEnum.Auth0);
  }

  async getCognitoUser(id: string) {
    return this.userRepository.findOne({
      id,
      source: UserSourceEnum.Cognito,
    });
  }

  async getAuth0User(id: string) {
    return this.userRepository.findOne({
      id,
      source: UserSourceEnum.Auth0,
    });
  }
}
