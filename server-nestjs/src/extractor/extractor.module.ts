import { Module } from '@nestjs/common';
import { ExtractorService } from './extractor.service';
import { ExtractorController } from './extractor.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ExtractorController],
    providers: [ExtractorService],
    exports: [ExtractorService],
})
export class ExtractorModule { }
