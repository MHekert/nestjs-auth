import { ConfigService } from '@nestjs/config';

export const cognitoJwksUriFactory = (cfg: ConfigService) => {
  const awsRegion = cfg.get('AWS_REGION');
  const cognitoUserPool = cfg.get('COGNITO_USER_POOL');

  return `https://cognito-idp.${awsRegion}.amazonaws.com/${cognitoUserPool}/.well-known/jwks.json`;
};
