import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService,
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @UseGuards(JwtAuthGuard)
  @Get('stats')
  async getStats(@Request() req) {
    const contactsCount = await this.prisma.contact.count({
      where: { userId: req.user.id },
    });
    const groupsCount = await this.prisma.group.count({
      where: { userId: req.user.id },
    });
    return { contacts: contactsCount, groups: groupsCount };
  }

  @UseGuards(JwtAuthGuard)
  @Get('posts')
  async getPosts(@Request() req) {
    return this.prisma.post.findMany({
      where: {
        group: {
          userId: req.user.id,
        },
      },
      include: {
        group: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
