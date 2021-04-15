import { CanActivate, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard
  extends AuthGuard(['auth0', 'cognito'])
  implements CanActivate {}
