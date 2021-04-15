import { plainToClass, Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNumber,
  IsString,
  validateSync,
} from 'class-validator';
import { EnvironmentEnum } from '../common/enums/environment.enum';

class EnvironmentVariables {
  @IsEnum(EnvironmentEnum)
  NODE_ENV: EnvironmentEnum = EnvironmentEnum.Development;

  @Transform((params) => parseInt(params.value, 10))
  @IsNumber({
    allowNaN: false,
    maxDecimalPlaces: 0,
  })
  PORT = 3000;

  @Transform((params) => parseInt(params.value, 10))
  @IsNumber({
    allowNaN: false,
    maxDecimalPlaces: 0,
  })
  DB_PORT: number;

  @IsString()
  DB_HOSTNAME: string;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_NAME: string;

  @Transform((params) => params.value === 'true')
  @IsBoolean()
  TYPE_ORM_SYNCHRONIZE: boolean;

  @Transform((params) => params.value === 'true')
  @IsBoolean()
  TYPE_ORM_LOGGING: boolean;

  @IsString()
  COGNITO_USER_POOL: string;

  @IsString()
  AWS_REGION: string;

  @IsString()
  AUTH0_DOMAIN: string;
}

export const validateEnv = (config: Record<string, unknown>) => {
  const validatedConfig = plainToClass(EnvironmentVariables, config, {});
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return validatedConfig;
};
