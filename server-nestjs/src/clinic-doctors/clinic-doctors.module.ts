import { Module } from '@nestjs/common';
import { ClinicDoctorsController } from './clinic-doctors.controller';
import { ClinicDoctorsService } from './clinic-doctors.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ClinicDoctorsController],
  providers: [ClinicDoctorsService],
  exports: [ClinicDoctorsService],
})
export class ClinicDoctorsModule {}
