import { CanActivate, ExecutionContext } from '@nestjs/common';
import { userMockFactory } from '../../data-layer/entities/user.mock';

export class JwtAuthGuardMock implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    req.user = userMockFactory();

    return true;
  }
}
