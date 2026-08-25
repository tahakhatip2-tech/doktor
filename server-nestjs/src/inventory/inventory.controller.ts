import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto, UpdateInventoryDto } from './dto/inventory.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get()
  findAll(@Req() req) {
    // Both pharmacy admin and pharmacy staff might access this, use req.user.id
    // Wait, typically pharmacyId is the clinicId in this system context? 
    // If the user role is PHARMACY, their ID is the pharmacyId.
    const pharmacyId = req.user.id;
    return this.inventoryService.findAll(pharmacyId);
  }

  @Get('low-stock')
  getLowStock(@Req() req) {
    return this.inventoryService.getLowStock(req.user.id);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Req() req) {
    return this.inventoryService.findOne(+id, req.user.id);
  }

  @Post()
  create(@Req() req, @Body() createInventoryDto: CreateInventoryDto) {
    return this.inventoryService.create(req.user.id, createInventoryDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Req() req, @Body() updateInventoryDto: UpdateInventoryDto) {
    return this.inventoryService.update(+id, req.user.id, updateInventoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Req() req) {
    return this.inventoryService.remove(+id, req.user.id);
  }
}
