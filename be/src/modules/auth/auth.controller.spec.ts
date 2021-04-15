import { Test, TestingModule } from '@nestjs/testing';
import { userMockFactory } from '../../data-layer/entities/user.mock';
import { AuthController } from './auth.controller';
import { UserDto } from './dto/user.dto';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getMe', () => {
    it('should', () => {
      const userMock = userMockFactory();

      const resp = controller.getMe(userMock);

      expect(resp).toBeInstanceOf(UserDto);
      expect(resp).toMatchObject({
        id: expect.any(String),
        email: expect.any(String),
        source: expect.any(String),
      });
    });
  });
});
