import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersModule } from '../../users/users.module';
import { Auth0Strategy } from './auth0.strategy';
import { auth0JwksUriFactory } from './util/auth0-jwks-uri-factory';

@Module({
  imports: [UsersModule],
  controllers: [],
  providers: [
    Auth0Strategy,
    {
      provide: 'AUTH0_JWKS_URI',
      inject: [ConfigService],
      useFactory: auth0JwksUriFactory,
    },
  ],
})
export class Auth0Module {}
