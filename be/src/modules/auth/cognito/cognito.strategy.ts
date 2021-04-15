import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';
import { UsersService } from '../../users/users.service';

@Injectable()
export class CognitoStrategy extends PassportStrategy(Strategy, 'cognito') {
  constructor(
    @Inject('COGNITO_JWKS_URI') jwksUri: string,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: jwksRsa.passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri,
      }),
    });
  }

  async validate(payload: Record<string, any>) {
    const id = payload?.sub;
    const email = payload?.email;

    if (!email || !id) {
      throw new UnauthorizedException();
    }

    const user = await this.usersService.getCognitoUser(id);
    if (user) return user;

    return await this.usersService.addCognitoUser(id, email);
  }
}
