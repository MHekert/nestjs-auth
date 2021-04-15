import { User } from './user.entity';
import * as faker from 'faker';
import { UserSourceEnum } from '../../common/enums/user-source.enum';

export const cognitoUserMockFactory = (): User => {
  const userMock = new User();
  userMock.id = faker.random.alphaNumeric(15);
  userMock.email = faker.internet.email();
  userMock.source = UserSourceEnum.Cognito;

  return userMock;
};

export const auth0UserMockFactory = (): User => {
  const userMock = new User();
  userMock.id = faker.random.alphaNumeric(15);
  userMock.email = faker.internet.email();
  userMock.source = UserSourceEnum.Auth0;

  return userMock;
};

export const userMockFactory = faker.random.arrayElement([
  cognitoUserMockFactory,
  auth0UserMockFactory,
]);
