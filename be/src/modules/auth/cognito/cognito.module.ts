import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersModule } from '../../users/users.module';
import { CognitoStrategy } from './cognito.strategy';
import { cognitoJwksUriFactory } from './util/cognito-jwks-uri-factory';

@Module({
  imports: [UsersModule],
  controllers: [],
  providers: [
    CognitoStrategy,
    {
      provide: 'COGNITO_JWKS_URI',
      inject: [ConfigService],
      useFactory: cognitoJwksUriFactory,
    },
  ],
})
export class CognitoModule {}
