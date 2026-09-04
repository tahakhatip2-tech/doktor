import { Module } from '@nestjs/common';
import { HomeCareServicesService } from './home-care-services.service';
import { HomeCareServicesController } from './home-care-services.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [HomeCareServicesController],
  providers: [HomeCareServicesService],
})
export class HomeCareServicesModule {}
