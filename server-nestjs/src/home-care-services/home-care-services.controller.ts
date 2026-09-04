import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { HomeCareServicesService } from './home-care-services.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Home Care Services')
@Controller('home-care-services')
export class HomeCareServicesController {
    constructor(private readonly homeCareServicesService: HomeCareServicesService) {}

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.USER, UserRole.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @Get()
    findAll(@Request() req: any) {
        return this.homeCareServicesService.findAll(req.user.id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.USER, UserRole.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
        return this.homeCareServicesService.findOne(id, req.user.id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.USER, UserRole.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @Post()
    create(@Body() createDto: any, @Request() req: any) {
        return this.homeCareServicesService.create(req.user.id, createDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.USER, UserRole.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: any, @Request() req: any) {
        return this.homeCareServicesService.update(id, req.user.id, updateDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.USER, UserRole.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
        return this.homeCareServicesService.remove(id, req.user.id);
    }
}
