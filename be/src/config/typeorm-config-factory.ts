import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfigFactory = (
  configService: ConfigService,
): TypeOrmModuleOptions =>
  <TypeOrmModuleOptions>{
    type: 'postgres' as const,
    port: configService.get('DB_PORT'),
    host: configService.get('DB_HOSTNAME'),
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    database: configService.get('DB_NAME'),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    synchronize: configService.get('TYPE_ORM_SYNCHRONIZE'),
    migrationsRun: true,
    migrations: [__dirname + '/../../migrations/**/*{.ts,.js}'],
    logging: configService.get('TYPE_ORM_LOGGING'),
  };
