import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../users/users.service';
import { UsersServiceMockFactory } from '../../users/users.service.mock';
import { Auth0Strategy } from './auth0.strategy';
import * as faker from 'faker';
import { UnauthorizedException } from '@nestjs/common';
import { auth0UserMockFactory } from '../../../data-layer/entities/user.mock';

describe('Auth0Strategy', () => {
  let provider: Auth0Strategy;
  let usersService: Partial<UsersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        Auth0Strategy,
        {
          provide: UsersService,
          useFactory: UsersServiceMockFactory,
        },
        {
          provide: 'AUTH0_JWKS_URI',
          useValue: 'fake',
        },
      ],
    }).compile();

    provider = module.get<Auth0Strategy>(Auth0Strategy);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('validate', () => {
    const userMock = auth0UserMockFactory();

    it('should return existing user', async () => {
      (<any>usersService.getAuth0User).mockResolvedValue(userMock);

      const payload = {
        sub: faker.random.alphaNumeric(15),
        email: faker.internet.email(),
      };

      const resp = await provider.validate(payload);

      expect(usersService.getAuth0User).toBeCalledTimes(1);
      expect(usersService.getAuth0User).toBeCalledWith(payload.sub);
      expect(usersService.addAuth0User).toBeCalledTimes(0);
      expect(resp).toBe(userMock);
    });

    it('should return newly created user', async () => {
      (<any>usersService.getAuth0User).mockResolvedValue(undefined);
      (<any>usersService.addAuth0User).mockResolvedValue(userMock);

      const payload = {
        sub: faker.random.alphaNumeric(15),
        email: faker.internet.email(),
      };

      const resp = await provider.validate(payload);

      expect(usersService.getAuth0User).toBeCalledTimes(1);
      expect(usersService.getAuth0User).toBeCalledWith(payload.sub);
      expect(usersService.addAuth0User).toBeCalledTimes(1);
      expect(usersService.addAuth0User).toBeCalledWith(
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
      expect(usersService.getAuth0User).toBeCalledTimes(0);
      expect(usersService.addAuth0User).toBeCalledTimes(0);
    });
  });
});
