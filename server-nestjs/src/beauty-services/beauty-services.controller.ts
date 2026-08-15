import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { BeautyServicesService } from './beauty-services.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Beauty Services')
@Controller('beauty-services')
export class BeautyServicesController {
    constructor(private readonly beautyServicesService: BeautyServicesService) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.USER, UserRole.ADMIN, UserRole.BEAUTY)
    @ApiBearerAuth('JWT-auth')
    @Get()
    findAll(@Request() req: any) {
        return this.beautyServicesService.findAll(req.user.id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.USER, UserRole.ADMIN, UserRole.BEAUTY)
    @ApiBearerAuth('JWT-auth')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
        return this.beautyServicesService.findOne(id, req.user.id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.USER, UserRole.ADMIN, UserRole.BEAUTY)
    @ApiBearerAuth('JWT-auth')
    @Post()
    create(@Body() createDto: any, @Request() req: any) {
        return this.beautyServicesService.create(req.user.id, createDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.USER, UserRole.ADMIN, UserRole.BEAUTY)
    @ApiBearerAuth('JWT-auth')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: any, @Request() req: any) {
        return this.beautyServicesService.update(id, req.user.id, updateDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.USER, UserRole.ADMIN, UserRole.BEAUTY)
    @ApiBearerAuth('JWT-auth')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
        return this.beautyServicesService.remove(id, req.user.id);
    }
}
