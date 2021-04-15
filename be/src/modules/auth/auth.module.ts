import { Module } from '@nestjs/common';
import { CognitoModule } from './cognito/cognito.module';
import { Auth0Module } from './auth0/auth0.module';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';

@Module({
  imports: [CognitoModule, Auth0Module, PassportModule.register({})],
  controllers: [AuthController],
})
export class AuthModule {}
