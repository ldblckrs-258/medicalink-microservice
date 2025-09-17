import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthVersionRepository {
  constructor(private prisma: PrismaService) {}

  async getOrCreateAuthVersion(userId: string): Promise<number> {
    const authVersion = await this.prisma.authVersion.upsert({
      where: { userId },
      update: {},
      create: {
        userId,
        version: 1,
      },
    });

    return authVersion.version;
  }

  async incrementAuthVersion(userId: string): Promise<number> {
    const authVersion = await this.prisma.authVersion.upsert({
      where: { userId },
      update: {
        version: {
          increment: 1,
        },
      },
      create: {
        userId,
        version: 1,
      },
    });

    return authVersion.version;
  }

  async getAuthVersion(userId: string): Promise<number | null> {
    const authVersion = await this.prisma.authVersion.findUnique({
      where: { userId },
    });

    return authVersion?.version || null;
  }
}
