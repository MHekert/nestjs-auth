import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { JwtAuthGuard } from '../src/modules/auth/jwt.guard';
import { JwtAuthGuardMock } from '../src/modules/auth/jwt.guard.mock';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideGuard(JwtAuthGuard)
      .useClass(JwtAuthGuardMock)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/auth/me (GET)', async () => {
    return request(app.getHttpServer())
      .get('/auth/me')
      .expect(200)
      .then((response) => {
        expect(response.body).toMatchObject({
          id: expect.any(String),
          email: expect.any(String),
          source: expect.any(String),
        });
      });
  });
});
