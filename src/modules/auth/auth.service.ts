import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { signupDto } from './dto/signup.dto';
import {
  DoctorRepository,
  PatientRepository,
  type UserDocument,
  UserRepository,
} from 'src/db';
import { compareHash } from 'src/utils';
import { LoginDto } from './dto/login.dto';
import { TokenService } from 'src/utils/security/token.security';
import {
  ConsultationModeEnum,
  DoctorStatusEnum,
  IAuthRequest,
  LoginCredentialsResponse,
  RoleEnum,
} from 'src/common';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tokenService: TokenService,
    private readonly patientRepository: PatientRepository,
    private readonly doctorRepository: DoctorRepository,
  ) {}

  async signup(dto: signupDto): Promise<{ message: string }> {
    const {
      fullName,
      userName,
      email,
      password,
      role,
      phoneNumber,
      gender,
      dateOfBirth,
    } = dto;

    const existingUser = await this.userRepository.findOne({
      filter: { email },
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    if (role === RoleEnum.doctor) {
      if (
        !dto.specialty ||
        !dto.degree ||
        !dto.licenseNumber ||
        !dto.yearsOfExperience
      ) {
        throw new BadRequestException(
          'please provide specialty, degree, licenseNumber and yearsOfExperience',
        );
      }
    }

    const [user] =
      (await this.userRepository.create({
        data: [
          {
            fullName,
            userName,
            email,
            password,
            role,
            phoneNumber,
            gender,
            dateOfBirth,
            isActive: role === RoleEnum.patient,
            isEmailVerified: false,
          },
        ],
      })) || [];

    if (!user)
      throw new BadRequestException(
        'fail to signup this user, please try again later',
      );

    if (role === RoleEnum.patient) {
      await this.patientRepository.create({
        data: [
          {
            userId: user._id,
            bloodType: dto.bloodType,
            preferredLanguage: 'ar',
            notificationPreferences: {
              email: true,
              sms: true,
              push: true,
            },
          },
        ],
      });
    } else if (role === RoleEnum.doctor) {
      await this.doctorRepository.create({
        data: [
          {
            userId: user._id,
            specialty: dto.specialty,
            degree: dto.degree,
            licenseNumber: dto.licenseNumber,
            yearsOfExperience: dto.yearsOfExperience,
            consultationModes: [ConsultationModeEnum.inClinic],
            consultationFee: {
              inClinic: dto.consultationFee?.inClinic || 0,
              online: dto.consultationFee?.online || 0,
            },
            sessionDuration: 30,
            status: DoctorStatusEnum.available,
            isAcceptingNewPatients: false,
            isVerified: false,
            languages: ['Arabic'],
          },
        ],
      });
    }

    return {
      message:
        role === RoleEnum.patient
          ? 'signup successfully, please check your email to verify your account'
          : 'تم التسجيل بنجاح، سيتم مراجعة حسابك قريباً',
    };
  }

  async login(dto: LoginDto): Promise<LoginCredentialsResponse> {
    const { password, email } = dto;

    const user = await this.userRepository.findOne({
      filter: { email: email },
    });

    if (!user) {
      throw new UnauthorizedException(
        'please check your credentials and try again',
      );
    }

    if (!user.isActive) {
      throw new UnauthorizedException('account is not active');
    }

    if (!(await compareHash(password, user.password))) {
      throw new UnauthorizedException('password is incorrect');
    }

    return await this.tokenService.createLoginCredentials(user as UserDocument);
  }

  async refreshToken(req: IAuthRequest) {
    const credentials = await this.tokenService.createLoginCredentials(
      req.user,
    );
    await this.tokenService.revokeToken(req.decoded);
    return credentials;
  }

  async logout(req: IAuthRequest): Promise<{ message: string }> {
    await this.tokenService.revokeToken(req.decoded);
    return {
      message: 'logged out successfully',
    };
  }

  async getCurrentUser(userId: string) {
    const user = await this.userRepository.findOne({ filter: { _id: userId } });

    if (!user) {
      throw new UnauthorizedException('user is not found');
    }

    const userWithRole = await this.userRepository.findOne({
      filter: {
        _id: userId,
      },
    });

    if (!userWithRole) {
      throw new UnauthorizedException(
        'user with this credentials is not found',
      );
    }

    return {
      id: user._id,
      fullName: user.fullName,
      username: user.userName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      isEmailVerified: user.isEmailVerified,
      isPhoneVerified: user.isPhoneVerified,
      avatar: user.avatar,
      phoneNumber: user.phoneNumber,
      gender: user.gender,
      dateOfBirth: user.dateOfBirth,
    };
  }
}
