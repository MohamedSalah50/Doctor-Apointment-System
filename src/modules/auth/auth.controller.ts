import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  Req,
  Get,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { signupDto } from './dto/signup.dto';
import { LoginDto } from './dto/login.dto';
import { auth } from 'src/common/decorators/auth.decorator';
import { type IAuthRequest, IResponse, RoleEnum, tokenEnum } from 'src/common';
import { successResponse } from 'src/utils';
import { LoginResponse } from './entities/auth.entity';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async signup(
    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        stopAtFirstError: true,
      }),
    )
    dto: signupDto,
  ): Promise<IResponse> {
    await this.authService.signup(dto);
    return successResponse({
      message: 'user created successfully',
      status: 201,
    });
  }

  @Post('/login')
  async login(
    @Body(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        stopAtFirstError: true,
      }),
    )
    dto: LoginDto,
  ): Promise<IResponse<LoginResponse>> {
    const credentials = await this.authService.login(dto);
    return successResponse<LoginResponse>({ data: { credentials } });
  }

  @Post('/refresh-token')
  @auth([RoleEnum.patient, RoleEnum.admin, RoleEnum.doctor], tokenEnum.refresh)
  async refreshToken(
    @Req() req: IAuthRequest,
  ): Promise<IResponse<LoginResponse>> {
    const credentials = await this.authService.refreshToken(req);
    return successResponse<LoginResponse>({ data: { credentials } });
  }

  @auth([RoleEnum.patient, RoleEnum.admin, RoleEnum.doctor])
  @Post('logout')
  async logout(@Req() req: IAuthRequest) {
    return await this.authService.logout(req);
  }

  @auth([RoleEnum.patient, RoleEnum.admin, RoleEnum.doctor])
  @Get('me')
  async getCurrentUser(@Req() req: IAuthRequest) {
    return await this.authService.getCurrentUser(req.user._id.toString());
  }
}
