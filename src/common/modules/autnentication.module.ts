import { Global, Module } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenModel, TokenRepository, UserModel, UserRepository } from 'src/db';
import { TokenService } from 'src/utils/security/token.security';

@Global()
@Module({
  imports: [UserModel, TokenModel],
  controllers: [],
  providers: [UserRepository, TokenService, JwtService, TokenRepository],
  exports: [UserRepository, TokenService, JwtService, TokenRepository, UserModel, TokenModel],
})
export class SharedAutnenticationModule {}
