import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { tokenName } from 'src/common/decorators/tokenType.decorator';
import { tokenEnum } from 'src/common/enums';
import { TokenService } from 'src/utils/security/token.security';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private readonly tokensService: TokenService,
    private readonly reflector: Reflector,
  ) { }
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const tokenType: tokenEnum =
      this.reflector.getAllAndOverride<tokenEnum>(tokenName, [
        context.getHandler(),
        context.getClass(),
      ]) ?? tokenEnum.access;

    // console.log({ context, tokenType });

    let req: any;
    let authorization: string = '';
    switch (context.getType()) {
      case 'http':
        const httpCtx = context.switchToHttp();
        req = httpCtx.getRequest();
        authorization = req.headers.authorization;
        break;
      //   case 'rpc':
      //     const rpcCtx = context.switchToRpc();
      //     break;
      //   case 'ws': 
      //     const wsCtx = context.switchToWs();
      //     break;
      default:
        break;
    }
    const { user, decoded } = await this.tokensService.decodeToken({
      authorization,
      tokenType,
    });

    req.credentials = { user, decoded };
    req.user = user
    req.decoded = decoded
    return true;
  }
}
