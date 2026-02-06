import { applyDecorators, UseGuards } from '@nestjs/common';
import { RoleEnum, tokenEnum } from '../enums';
import { Roles } from './role.decorator';
import { Token } from './tokenType.decorator';
import { AuthorizationGuard } from '../guards/authorization/guard.authorization';
import { AuthenticationGuard } from '../guards/authentication/guard.authentication';

export function auth(roles: RoleEnum[], type: tokenEnum = tokenEnum.access) {
  return applyDecorators(
    Token(type),
    Roles(roles),
    UseGuards(AuthenticationGuard, AuthorizationGuard),
  );
}
