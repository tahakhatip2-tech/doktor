import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { LaboratoryService } from './laboratory.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Laboratory')
@Controller('laboratory')
export class LaboratoryController {
    constructor(private readonly laboratoryService: LaboratoryService) {}

    // --- Lab Tests ---
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.USER, UserRole.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @Get('tests')
    getLabTests(@Request() req: any) {
        return this.laboratoryService.getLabTests(req.user.id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.USER, UserRole.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @Post('tests')
    createLabTest(@Body() createDto: any, @Request() req: any) {
        return this.laboratoryService.createLabTest(req.user.id, createDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.USER, UserRole.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @Patch('tests/:id')
    updateLabTest(@Param('id', ParseIntPipe) id: number, @Body() updateDto: any, @Request() req: any) {
        return this.laboratoryService.updateLabTest(id, req.user.id, updateDto);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.USER, UserRole.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @Delete('tests/:id')
    deleteLabTest(@Param('id', ParseIntPipe) id: number, @Request() req: any) {
        return this.laboratoryService.deleteLabTest(id, req.user.id);
    }

    // --- Lab Orders ---
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.USER, UserRole.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @Get('orders')
    getLabOrders(@Request() req: any) {
        return this.laboratoryService.getLabOrders(req.user.id);
    }

    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.USER, UserRole.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @Patch('orders/:id/status')
    updateLabOrderStatus(@Param('id', ParseIntPipe) id: number, @Body('status') status: string, @Request() req: any) {
        return this.laboratoryService.updateLabOrderStatus(id, req.user.id, status);
    }

    // --- Lab Results ---
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles(UserRole.USER, UserRole.ADMIN)
    @ApiBearerAuth('JWT-auth')
    @Post('orders/:id/results')
    saveLabResult(@Param('id', ParseIntPipe) id: number, @Body() data: any, @Request() req: any) {
        return this.laboratoryService.saveLabResult(req.user.id, id, data);
    }
}
