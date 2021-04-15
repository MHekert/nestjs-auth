import { Controller, Get, UseGuards } from '@nestjs/common';
import { plainToClass } from 'class-transformer';
import { User } from '../../data-layer/entities/user.entity';
import { UserDto } from './dto/user.dto';
import { GetUser } from './get-user';
import { JwtAuthGuard } from './jwt.guard';

@Controller('auth')
export class AuthController {
  @Get('/me')
  @UseGuards(JwtAuthGuard)
  getMe(@GetUser() user: User): UserDto {
    return plainToClass(UserDto, user, {
      excludeExtraneousValues: true,
    });
  }
}
