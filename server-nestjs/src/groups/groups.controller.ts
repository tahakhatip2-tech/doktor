import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { GroupsService } from './groups.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
    constructor(private readonly groupsService: GroupsService) { }

    @Get()
    findAll(@Request() req) {
        return this.groupsService.findAll(req.user.id);
    }

    @Post()
    create(@Request() req, @Body() data: any) {
        return this.groupsService.create(req.user.id, data);
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Request() req, @Body() data: any) {
        return this.groupsService.update(id, req.user.id, data);
    }

    @Delete(':id')
    remove(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.groupsService.remove(id, req.user.id);
    }
}
