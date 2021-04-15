import { UsersService } from './users.service';

export const UsersServiceMockFactory: () => Partial<UsersService> = () => ({
  addAuth0User: jest.fn(),
  addCognitoUser: jest.fn(),
  getAuth0User: jest.fn(),
  getCognitoUser: jest.fn(),
});
