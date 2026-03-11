import { Controller, Get, Post, Delete, Param, Body, UseGuards, ParseIntPipe, Req } from '@nestjs/common';
import { OffersService } from './offers.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { AuthGuard } from '@nestjs/passport';
import { PatientAuthGuard } from '../patient/patient-auth.guard';

// ─── Authenticated User Request interface ─────────────────────────────────────
interface AuthRequest extends Request {
    user: { id: number };
}

// ─── Doctor endpoints ──────────────────────────────────────────────────────────
@Controller('offers')
export class OffersController {
    constructor(private readonly offersService: OffersService) {}

    /** إنشاء عرض جديد (الطبيب) */
    @Post()
    @UseGuards(AuthGuard('jwt'))
    create(@Req() req: AuthRequest, @Body() dto: CreateOfferDto) {
        return this.offersService.create(req.user.id, dto);
    }

    /** جلب عروض الطبيب (الطبيب) */
    @Get('mine')
    @UseGuards(AuthGuard('jwt'))
    getMyOffers(@Req() req: AuthRequest) {
        return this.offersService.findMyOffers(req.user.id);
    }

    /** حذف عرض (الطبيب) */
    @Delete(':id')
    @UseGuards(AuthGuard('jwt'))
    delete(@Req() req: AuthRequest, @Param('id', ParseIntPipe) id: number) {
        return this.offersService.delete(req.user.id, id);
    }

    /** جلب الـ Feed العام (متاح للجميع) */
    @Get('feed')
    getFeed() {
        return this.offersService.getActiveFeed();
    }
}

// ─── Patient endpoints ─────────────────────────────────────────────────────────
@Controller('patient/offers')
export class PatientOffersController {
    constructor(private readonly offersService: OffersService) {}

    /** جلب الـ Feed للمريض (مع حالة الإعجاب) */
    @Get('feed')
    @UseGuards(PatientAuthGuard)
    getPatientFeed(@Req() req: any) {
        return this.offersService.getActiveFeed(req.user.id);
    }

    /** إعجاب / إلغاء إعجاب */
    @Post(':id/like')
    @UseGuards(PatientAuthGuard)
    toggleLike(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
        return this.offersService.toggleLike(id, req.user.id);
    }
}
