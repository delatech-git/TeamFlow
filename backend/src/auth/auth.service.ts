import { BadRequestException, Injectable } from '@nestjs/common';
import { Express } from 'express';
import { PrismaService } from '@/prisma/prisma.service';

import * as bcrypt from 'bcrypt';

import { RegisterDto } from './dto/register.dto';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { CloudinaryService } from '@/cloudinary/cloudinary.service';

@Injectable()
export class AuthService {
  constructor(
  private readonly prisma: PrismaService,
  private readonly jwtService: JwtService,
  private readonly cloudinaryService: CloudinaryService,
) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ username: dto.username }, { email: dto.username }],
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatches = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      username: user.username,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    };
  }
 async register(dto: RegisterDto, file?: Express.Multer.File) {
  const existingUser = await this.prisma.user.findFirst({
    where: {
      OR: [{ email: dto.email }, { username: dto.username }],
    },
  });

  if (existingUser) {
    throw new BadRequestException('User already exists');
  }

  let uploadedImage: Awaited<
    ReturnType<CloudinaryService['uploadAvatar']>
  > | null = null;

  try {
    if (file) {
      uploadedImage = await this.cloudinaryService.uploadAvatar(file);
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        email: dto.email,
        fullName: dto.fullName,
        passwordHash,
        avatarUrl: uploadedImage?.secure_url ?? null,
        avatarPublicId: uploadedImage?.public_id ?? null,
      },
    });

    const accessToken = await this.jwtService.signAsync({
      sub: user.id,
      username: user.username,
      role: user.role,
    });

    return {
      accessToken,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        role: user.role,
      },
    };
  } catch (error) {
    if (uploadedImage?.public_id) {
      await this.cloudinaryService.deleteImage(uploadedImage.public_id);
    }

    throw error;
  }
}

  async me(userId: string) {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },

      select: {
        id: true,
        username: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        createdAt: true,
      },
    });
  }

  async uploadAvatar(userId: string, file: Express.Multer.File) {
  const existingUser = await this.prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      avatarPublicId: true,
    },
  });

  if (!existingUser) {
    throw new UnauthorizedException('User not found');
  }

  const uploadedImage = await this.cloudinaryService.uploadAvatar(file);

  const updatedUser = await this.prisma.user.update({
    where: { id: userId },
    data: {
      avatarUrl: uploadedImage.secure_url,
      avatarPublicId: uploadedImage.public_id,
    },
    select: {
      id: true,
      username: true,
      email: true,
      fullName: true,
      avatarUrl: true,
      role: true,
      createdAt: true,
    },
  });

  if (existingUser.avatarPublicId) {
    await this.cloudinaryService.deleteImage(existingUser.avatarPublicId);
  }

  return updatedUser;
}
}
