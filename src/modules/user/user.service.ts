import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from 'src/db';
import { Types } from 'mongoose';
import { UpdateUserDto } from './dto/update-user.dto';
import { compareHash, generateHash } from 'src/utils';
import { ChangePasswordDto } from './dto/updatePassword.dto';

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async findAll() {
    const users = await this.userRepository.find({
      filter: {},
      select: { password: 0 },
    });

    return {
      data: users,
      total: users.length,
    };
  }

  async findOne(id: string) {
    const user = await this.userRepository.findOne({
      filter: { _id: id },
      select: { password: 0 },
    });

    if (!user) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    return {
      data: user,
    };
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const existingUser = await this.userRepository.findOne({
      filter: { _id: id },
    });

    if (!existingUser) {
      throw new NotFoundException("user doesn't exist");
    }

    if (
      updateUserDto.userName &&
      updateUserDto.userName !== existingUser.userName
    ) {
      const usernameExists = await this.userRepository.findOne({
        filter: {
          userName: updateUserDto.userName,
          _id: { $ne: id },
        },
      });

      if (usernameExists) {
        throw new ConflictException('UserName already exists');
      }
    }

    if (updateUserDto.email && updateUserDto.email !== existingUser.email) {
      const emailExists = await this.userRepository.findOne({
        filter: {
          email: updateUserDto.email,
          _id: { $ne: id },
        },
      });

      if (emailExists) {
        throw new ConflictException('email already exists');
      }
    }

    const updateData: any = { ...updateUserDto };

    const updatedUser = await this.userRepository.findOneAndUpdate({
      filter: { _id: id },
      update: updateData,
    });

    if (!updatedUser) {
      throw new NotFoundException('المستخدم غير موجود');
    }

    const { password, ...userWithoutPassword } = updatedUser.toObject();

    return {
      message: 'تم تعديل المستخدم بنجاح',
      data: userWithoutPassword,
    };
  }

  async softDelete(id: Types.ObjectId) {
    const user = await this.userRepository.findOneAndUpdate({
      filter: { _id: id, freezedAt: { $exists: false } },
      update: { freezedAt: true },
    });

    if (!user) {
      throw new NotFoundException("user doesn't exist");
    }

    return {
      message: 'user deleted successfully',
    };
  }

  async toggleStatus(id: string) {
    const user = await this.userRepository.findOne({ filter: { _id: id } });

    if (!user) {
      throw new NotFoundException("user doesn't exist");
    }

    const updatedUser = await this.userRepository.findOneAndUpdate({
      filter: { _id: id },
      update: { isActive: !user.isActive },
    });

    if (!updatedUser) {
      throw new NotFoundException("user doesn't exist");
    }

    return {
      message: `تم ${updatedUser.isActive ? "activating" : 'deactivating'} for user successfully`,
      data: {
        id: updatedUser._id,
        isActive: updatedUser.isActive,
      },
    };
  }

  async changePassword(
    userId: Types.ObjectId,
    changePasswordDto: ChangePasswordDto,
  ) {
    const user = await this.userRepository.findOne({ filter: { _id: userId } });

    if (!user) {
      throw new NotFoundException("user doesn't exist");
    }

    if (!(await compareHash(changePasswordDto.oldPassword, user.password))) {
      throw new UnauthorizedException('password is incorrect');
    }

    if(changePasswordDto.newPassword === changePasswordDto.oldPassword) {
      throw new UnauthorizedException('new password must be different from old password');
    }

    const hashedPassword = await generateHash(changePasswordDto.newPassword);

    await this.userRepository.findOneAndUpdate({
      filter: { _id: userId },
      update: { password: hashedPassword, changeCredentialTime: new Date() },
    });

    return {
      message: 'password changed successfully',
    };
  }

  async search(query: string) {
    const users = await this.userRepository.find({
      filter: {
        $or: [
          { fullName: { $regex: query, $options: 'i' } },
          { userName: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
        ],
      },
    });

    const usersWithoutPasswords = users.map((user) => {
      const { password, ...userWithoutPassword } = user.toObject();
      return userWithoutPassword;
    });

    return {
      data: usersWithoutPasswords,
      total: usersWithoutPasswords.length,
    };
  }
}
