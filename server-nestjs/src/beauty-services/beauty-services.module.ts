import { Module } from '@nestjs/common';
import { BeautyServicesService } from './beauty-services.service';
import { BeautyServicesController } from './beauty-services.controller';

@Module({
  controllers: [BeautyServicesController],
  providers: [BeautyServicesService]
})
export class BeautyServicesModule {}
