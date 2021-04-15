import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../data-layer/entities/user.entity';
import { UserRepository } from '../../data-layer/repositories/user.repository';
import { UsersService } from './users.service';
import * as faker from 'faker';
import { UserSourceEnum } from '../../common/enums/user-source.enum';

describe('UsersService', () => {
  let service: UsersService;
  let userRepositoryMock: Partial<UserRepository>;

  const id = faker.random.alphaNumeric(15);
  const email = faker.internet.email();

  beforeEach(async () => {
    userRepositoryMock = {
      addUser: jest.fn(),
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: userRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addCognitoUser', () => {
    it('should call addUser on userRepository with correct parameters', async () => {
      await service.addCognitoUser(id, email);

      expect(userRepositoryMock.addUser).toBeCalledTimes(1);
      expect(userRepositoryMock.addUser).toBeCalledWith(
        id,
        email,
        UserSourceEnum.Cognito,
      );
    });
  });

  describe('addAuth0User', () => {
    it('should call addUser on userRepository with correct parameters', async () => {
      await service.addAuth0User(id, email);

      expect(userRepositoryMock.addUser).toBeCalledTimes(1);
      expect(userRepositoryMock.addUser).toBeCalledWith(
        id,
        email,
        UserSourceEnum.Auth0,
      );
    });
  });

  describe('getCognitoUser', () => {
    it('should call findOne on userRepository with correct parameters', async () => {
      await service.getCognitoUser(id);

      expect(userRepositoryMock.findOne).toBeCalledTimes(1);
      expect(userRepositoryMock.findOne).toBeCalledWith({
        id,
        source: UserSourceEnum.Cognito,
      });
    });
  });

  describe('getAuth0User', () => {
    it('should call findOne on userRepository with correct parameters', async () => {
      await service.getAuth0User(id);

      expect(userRepositoryMock.findOne).toBeCalledTimes(1);
      expect(userRepositoryMock.findOne).toBeCalledWith({
        id,
        source: UserSourceEnum.Auth0,
      });
    });
  });
});
