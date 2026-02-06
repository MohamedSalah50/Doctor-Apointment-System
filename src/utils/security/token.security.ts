import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { JwtPayload } from 'jsonwebtoken';
import {
  LoginCredentialsResponse,
  RoleEnum,
  SignatureLevelEnum,
  tokenEnum,
} from 'src/common';
import {
  tokenDocument,
  TokenRepository,
  UserDocument,
  UserRepository,
} from 'src/db';
import { parseObjectId } from './objectId';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepository: UserRepository,
    private readonly tokenRepository: TokenRepository,
  ) {}

  generateToken = async ({
    payload,
    options = {
      secret: process.env.ACCESS_USER_TOKEN_SIGNATURE as string,
      expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN),
    },
  }: {
    payload: object;
    options: JwtSignOptions;
  }) => {
    return this.jwtService.signAsync(payload, options);
  };

  verifyToken = async ({
    token,
    options = {
      secret: process.env.ACCESS_USER_TOKEN_SIGNATURE as string,
    },
  }: {
    token: string;
    options?: JwtVerifyOptions;
  }): Promise<JwtPayload> => {
    return this.jwtService.verifyAsync(token, options) as unknown as JwtPayload;
  };

  detectSignatureLevel = async (
    role: RoleEnum = RoleEnum.patient,
  ): Promise<SignatureLevelEnum> => {
    let signatureLevel: SignatureLevelEnum = SignatureLevelEnum.Bearer;

    switch (role) {
      case RoleEnum.doctor:
      case RoleEnum.admin:
        signatureLevel = SignatureLevelEnum.System;
        break;
      default:
        signatureLevel = SignatureLevelEnum.Bearer;
    }

    return signatureLevel;
  };

  getSignatures = async (
    signatureLevel: SignatureLevelEnum = SignatureLevelEnum.Bearer,
  ): Promise<{ access_signature: string; refresh_signature: string }> => {
    let signatures: { access_signature: string; refresh_signature: string } = {
      access_signature: '',
      refresh_signature: '',
    };

    switch (signatureLevel) {
      case SignatureLevelEnum.System:
        signatures.access_signature = process.env
          .ACCESS_SYSTEM_TOKEN_SIGNATURE as string;
        signatures.refresh_signature = process.env
          .REFRESH_SYSTEM_TOKEN_SIGNATURE as string;
        break;
      default:
        signatures.access_signature = process.env
          .ACCESS_USER_TOKEN_SIGNATURE as string;
        signatures.refresh_signature = process.env
          .REFRESH_USER_TOKEN_SIGNATURE as string;
        break;
    }

    return signatures;
  };

  createLoginCredentials = async (
    user: UserDocument,
  ): Promise<LoginCredentialsResponse> => {
    const signatureLevel = await this.detectSignatureLevel(user.role);
    const signatures = await this.getSignatures(signatureLevel);

    const jwtid = randomUUID();

    const access_token = await this.generateToken({
      payload: { sub: user._id },
      options: {
        expiresIn: Number(process.env.ACCESS_TOKEN_EXPIRES_IN),
        secret: signatures.access_signature,
        jwtid,
      },
    });

    const refresh_token = await this.generateToken({
      payload: { sub: user._id },
      options: {
        expiresIn: Number(process.env.REFRESH_TOKEN_EXPIRES_IN),
        secret: signatures.refresh_signature,
        jwtid,
      },
    });

    return { access_token, refresh_token };
  };

  decodeToken = async ({
    authorization,
    tokenType = tokenEnum.access,
  }: {
    authorization: string;
    tokenType: tokenEnum;
  }) => {
    try {
      const [bearerKey, token] = authorization.split(' ');

      if (!bearerKey || !token) {
        throw new UnauthorizedException('من فضلك ادخل token صالح');
      }

      const signatures = await this.getSignatures(
        bearerKey as SignatureLevelEnum,
      );

      const decoded = await this.verifyToken({
        token,
        options: {
          secret:
            tokenType === tokenEnum.access
              ? signatures.access_signature
              : signatures.refresh_signature,
        },
      });

      if (!decoded?.sub || !decoded?.iat) {
        throw new BadRequestException('Token غير صالح');
        // throw new BadRequestException('Invalid token payload');
      }

      if (
        decoded.jti &&
        (await this.tokenRepository.findOne({ filter: { jti: decoded.jti } }))
      ) {
        throw new UnauthorizedException('Token منتهي أو تم إلغاؤه');
        // throw new UnauthorizedException('Invalid or old login credentials');
      }

      const user = (await this.userRepository.findOne({
        filter: { _id: decoded.sub },
      })) as UserDocument;

      if (!user) {
        throw new UnauthorizedException('المستخدم غير موجود');
        // throw new UnauthorizedException('not registered account');
      }

      if (!user.isActive) {
        throw new UnauthorizedException('الحساب غير نشط');
      }

      if ((user.changeCredentialTime?.getTime() || 0) > decoded.iat * 1000) {
        throw new UnauthorizedException(
          'Token منتهي، من فضلك سجل دخول مرة أخرى',
        );
        // throw new UnauthorizedException('Invalid or old login credentials');
      }

      return { user, decoded };
    } catch (error) {
      throw new InternalServerErrorException(error.message, 'حدث خطأ ما');
    }
  };

  revokeToken = async (decoded: JwtPayload): Promise<tokenDocument> => {
    const [result] =
      (await this.tokenRepository.create({
        data: [
          {
            jti: decoded.jti,
            expiredAt: new Date(
              ((decoded.iat as number) +
                Number(process.env.REFRESH_TOKEN_EXPIRES_IN)) *
                1000,
            ),
            createdBy: parseObjectId(decoded.sub as string),
          },
        ],
      })) || [];

    if (!result) {
      throw new BadRequestException('فشل في إلغاء الـ Token');
      //   throw new BadRequestException('fail to revoke this token');
    }

    return result;
  };
}
