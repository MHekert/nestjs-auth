# Nest.js API Cognito and/or Auth0 authentication

## Contents

Repository contains:

- Nest.js application
- Terraform IaC for configuring Cognito and Auth0
- Postman collections

### Directory structure

```
.
├── be
│   ├── migrations
│   ├── src
│   │   ├── common
│   │   │   └── enums
│   │   ├── config
│   │   ├── data-layer
│   │   │   ├── entities
│   │   │   └── repositories
│   │   └── modules
│   │       ├── auth
│   │       │   ├── auth0
│   │       │   │   └── util
│   │       │   ├── cognito
│   │       │   │   └── util
│   │       │   └── dto
│   │       └── users
│   └── test
├── postman
└── terraform
```

## Cognito and Auth0 top level overview

Cognito and Auth0 are powerful and highly customizable authentication services. They allow creating user pools of local users and users signed using social network account from such providers as Google or Facebook, unifying format between them. Those services can handle verification of email and phone number, MFA, password resetting, rate limiting and more. Both of them expose rich customizability through triggers in case of Cognito or rules/hooks in case of Auth0 that allow to run custom scripts modifying behavior at various lifecycle events.

Third party auth solutions help not only to decrease delivery time of application but also to limit possible security vulnerabilities by using continually battle tested and maintained services.

## Terraform IaC

`terraform` directory contains infrastructure as code written in Terraform. It creates fairly similar configuration to both services: it allows signing in using email and password or by using Google or Facebook account, requires email address verification through email and provides default login UI. Callback URL is set to `https://www.postman.com` to allow using Postman to obtaining tokens.

Configuring services using provided IaC requires:

- installed Terraform,
- created AWS account,
- created Auth0 account,
- Facebook developer account
- Facebook login configured
- Google account
- Google OAuth 2.0 configured
- passing environment values required by [auth0](https://registry.terraform.io/providers/alexkappa/auth0/latest/docs) and [aws](https://registry.terraform.io/providers/hashicorp/aws/latest/docs) providers specified in `terraform/terraform.tfvars`.

### Running terraform

Running from terraform directory:

```console
$ terraform apply
```

### Disclaimer

Unencrypted secrets should not be stored in repository. Either use secret manager or [mozilla/sops](https://github.com/mozilla/sops). State should be stored in remote backend.

## Postman collections

In `postman` directory are two collections - one for Auth0 and second for Cognito. Each collection contains request to get logged in user data from Nest.js API and configured OAuth 2.0 authorization code with PKCE flow simulating login in single page application through default UI provided by services. Before usage all necessary environment values need be set.

When starting obtaining tokens process Postman will redirect to default login URL where user can create account/login using email/password account or social provider (Google OAuth will not work inside Postman - https://support.google.com/accounts/answer/7675428)

After successful login tokens are returned: access token, id token and refresh token . Cognito returns every token as JWT and Auth0 returns id token as JWT, refresh token as opaque one and access token as opaque one by default but can be forced to return JWT when audience is query parameter is passed on authorization request.

For verifying using JWKS-RSA method Auth0 requires passing of audience in authorization URL as query param in format: `audience=https://{tenant}.auth0.com/api/v2/` and passing grant type in token request as query param in format: `grant_type=authorization_code`

## Nest.js API

In `be` directory is simple Nest.js backend application with one endpoint that returns authorized user's data decoded from id token and saves it to PostgreSQL database on first request.

### Modules

Application has two main modules `users` and `auth` which has two sub-modules: `cognito` and `auth0`.

`users` module has service for accessing persistance layer using repository patter of TypeORM.

Sub-modules of `auth` - `cognito` and `auth0` contain `Passport.js` strategies for corresponding providers.

`auth` module additionally contains controller with endpoint guarded by both strategies.

### Strategies

For implementing strategies are used `passport-jwt`, `@nestjs/passport` and `jwks-rsa` packages.

```typescript
import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import * as jwksRsa from 'jwks-rsa';
import { UsersService } from '../../users/users.service';

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
  ...
  }
}
```

Defined strategy extends `JWT` strategy provided by `passport-jwt` package. Token is extracted from id token which is passed as bearer in authorization header. Token is verified using public signing RSA key for key id that is present JWT's header as `kid` property. For retrieving signing key `jwks-rsa` package is used. It retrieves, caches response and rate limits requests.

Signing key is retrieved by HTTP GET request.
URL for Cognito has following format:

```
https://cognito-idp.${awsRegion}.amazonaws.com/${cognitoUserPool}/.well-known/jwks.json
```

URL for Auth0 has following format:

```
https://${auth0Domain}/.well-known/jwks.json
```

`jwksUri` is injected to Strategy class as custom provider created by factory function:

```typescript
@Module({
  imports: [UsersModule],
  controllers: [],
  providers: [
    CognitoStrategy,
    {
      provide: "COGNITO_JWKS_URI",
      inject: [ConfigService],
      useFactory: cognitoJwksUriFactory,
    },
  ],
})
export class CognitoModule {}
```

After token verification decoded payload is passed to validation method which check if all required properties are present, if user already exists and creates new user on first request. User object is returned and added to `request` object as `user` property by `Passport.js`.

```typescript
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
```

To check if valid id token is passed in request `AuthGuard` exported by `@nestjs/passport` package can be used. `AuthGuard` decorator can take either one or array of multiple strategies as parameter. Passed strategies names are used to determine which strategy should be used, when multiple passed then guard allows access when at least one strategies authorizes users access. Guards can be extended and even overridden when necessary

```typescript
@Injectable()
export class JwtAuthGuard
  extends AuthGuard(["auth0", "cognito"])
  implements CanActivate {}
```

For easier access to `user` object passed in `request` property custom decorator can be created

```typescript
export const GetUser = createParamDecorator(
  (_data, ctx: ExecutionContext): User => {
    const req = ctx.switchToHttp().getRequest();
    return req.user;
  }
);
```

Passport module needs to be registered before using

```typescript
@Module({
  imports: [CognitoModule, Auth0Module, PassportModule.register({})],
  controllers: [AuthController],
})
export class AuthModule {}
```

After finishing all previous steps guards can be added to specific endpoints, whole controller or even enabled globally. Passed `user` object can be accessed in the same way how query params, path params or body are accessed using decorator in controller method parameter.

```typescript
@Controller("auth")
export class AuthController {
  @Get("/me")
  @UseGuards(JwtAuthGuard)
  getMe(@GetUser() user: User): UserDto {
    return plainToClass(UserDto, user, {
      excludeExtraneousValues: true,
    });
  }
}
```

### Running locally

Steps to start app locally:

- change directory to `be` directory:

```console
$ cd be
```

- start docker compose with PostgreSQL container

```console
$ yarn docker:start
```

- install dependencies

```console
$ yarn install
```

- copy example `.env` file

```console
$ cp .env.example .env
```

- insert necessary environment variables
- run app in development mode

```console
$ yarn start:dev
```

### Testing

To run unit tests:

```console
$ yarn test
```

To run endpoints integration tests:

- copy example envs

```console
$ cp .env.test.example .env.test
```

- insert necessary environment variables
- start docker compose with PostgreSQL container

```console
$ yarn docker:start
```

- run tests

```console
$ yarn test:e2e
```
