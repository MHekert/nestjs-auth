import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../users/users.service';
import { UsersServiceMockFactory } from '../../users/users.service.mock';
import { CognitoStrategy } from './cognito.strategy';
import * as faker from 'faker';
import { UnauthorizedException } from '@nestjs/common';
import { cognitoUserMockFactory } from '../../../data-layer/entities/user.mock';

describe('CognitoStrategy', () => {
  let provider: CognitoStrategy;
  let usersService: Partial<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CognitoStrategy,
        {
          provide: UsersService,
          useFactory: UsersServiceMockFactory,
        },
        {
          provide: 'COGNITO_JWKS_URI',
          useValue: 'fake',
        },
      ],
    }).compile();

    provider = module.get<CognitoStrategy>(CognitoStrategy);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('validate', () => {
    const userMock = cognitoUserMockFactory();

    it('should return existing user', async () => {
      (<any>usersService.getCognitoUser).mockResolvedValue(userMock);

      const payload = {
        sub: faker.random.alphaNumeric(15),
        email: faker.internet.email(),
      };

      const resp = await provider.validate(payload);

      expect(usersService.getCognitoUser).toBeCalledTimes(1);
      expect(usersService.getCognitoUser).toBeCalledWith(payload.sub);
      expect(usersService.addCognitoUser).toBeCalledTimes(0);
      expect(resp).toBe(userMock);
    });

    it('should return newly created user', async () => {
      (<any>usersService.getCognitoUser).mockResolvedValue(undefined);
      (<any>usersService.addCognitoUser).mockResolvedValue(userMock);

      const payload = {
        sub: faker.random.alphaNumeric(15),
        email: faker.internet.email(),
      };

      const resp = await provider.validate(payload);

      expect(usersService.getCognitoUser).toBeCalledTimes(1);
      expect(usersService.getCognitoUser).toBeCalledWith(payload.sub);
      expect(usersService.addCognitoUser).toBeCalledTimes(1);
      expect(usersService.addCognitoUser).toBeCalledWith(
        payload.sub,
        payload.email,
      );
      expect(resp).toBe(userMock);
    });

    it('should throw unathorized exception when missing values in payload', async () => {
      const payload = {};

      await expect(provider.validate(payload)).rejects.toThrowError(
        UnauthorizedException,
      );
      expect(usersService.getCognitoUser).toBeCalledTimes(0);
      expect(usersService.addCognitoUser).toBeCalledTimes(0);
    });
  });
});
