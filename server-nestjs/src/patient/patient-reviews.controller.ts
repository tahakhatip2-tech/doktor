import {
  Controller, Get, Post, Body, Param, UseGuards, Request, ParseIntPipe,
} from '@nestjs/common';
import { PatientReviewsService } from './patient-reviews.service';
import { PatientAuthGuard } from './patient-auth.guard';

@Controller('patient/clinics')
export class PatientReviewsController {
  constructor(private readonly reviewsService: PatientReviewsService) {}

  // GET /patient/clinics/:id/reviews  (عام — لا يحتاج تسجيل دخول)
  @Get(':id/reviews')
  async getReviews(@Param('id', ParseIntPipe) clinicId: number) {
    return this.reviewsService.getClinicReviews(clinicId);
  }

  // GET /patient/clinics/:id/my-review  (يحتاج تسجيل دخول)
  @Get(':id/my-review')
  @UseGuards(PatientAuthGuard)
  async getMyReview(
    @Param('id', ParseIntPipe) clinicId: number,
    @Request() req: any,
  ) {
    return this.reviewsService.getMyReview(clinicId, req.user.id);
  }

  // POST /patient/clinics/:id/reviews  (يحتاج تسجيل دخول)
  @Post(':id/reviews')
  @UseGuards(PatientAuthGuard)
  async submitReview(
    @Param('id', ParseIntPipe) clinicId: number,
    @Request() req: any,
    @Body() body: { rating: number; comment?: string },
  ) {
    return this.reviewsService.upsertReview(
      clinicId,
      req.user.id,
      body.rating,
      body.comment,
    );
  }
}
