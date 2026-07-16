import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

import { PrismaService } from '@/prisma/prisma.service';
import { Prisma } from '../../generated/prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      select: this.userSelect(),
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: this.userSelect(),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.findOne(id);

    const { password, ...rest } = updateUserDto;
    const data: Prisma.UserUpdateInput = { ...rest };

    if (password) {
      data.passwordHash = await bcrypt.hash(password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: this.userSelect(),
    });
  }

  async updateAvatar(id: string, avatarUrl: string, avatarPublicId: string) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: {
        avatarUrl,
        avatarPublicId,
      },
      select: this.userSelect(),
    });
  }

  async remove(id: string, requestingUserId: string) {
    await this.findOne(id);

    if (id === requestingUserId) {
      throw new BadRequestException('You cannot delete your own account');
    }

    try {
      return await this.prisma.user.delete({
        where: { id },
        select: this.userSelect(),
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2003'
      ) {
        throw new BadRequestException(
          'Cannot delete this user because they still have ideas, comments, or other content. Remove or reassign that content first.',
        );
      }
      throw error;
    }
  }

  private userSelect() {
    return {
      id: true,
      username: true,
      email: true,
      fullName: true,
      avatarUrl: true,
      avatarPublicId: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    };
  }
}
