import { ConfigService } from '@nestjs/config';

export const auth0JwksUriFactory = (cfg: ConfigService) => {
  const auth0Domain = cfg.get('AUTH0_DOMAIN');

  return `https://${auth0Domain}/.well-known/jwks.json`;
};
