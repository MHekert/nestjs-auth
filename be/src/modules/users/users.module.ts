import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRepository } from '../../data-layer/repositories/user.repository';
import { UsersService } from './users.service';

@Module({
  providers: [UsersService],
  imports: [TypeOrmModule.forFeature([UserRepository])],
  exports: [UsersService],
})
export class UsersModule {}
