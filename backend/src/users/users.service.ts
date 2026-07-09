import { Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '@/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
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

    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
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

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.user.delete({
      where: { id },
      select: this.userSelect(),
    });
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
