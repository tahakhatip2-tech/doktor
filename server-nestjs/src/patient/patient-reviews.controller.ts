import {
  Controller, Get, Post, Body, Param, UseGuards, Request, ParseIntPipe,
} from '@nestjs/common';
import { PatientReviewsService } from './patient-reviews.service';
import { PatientAuthGuard } from './patient-auth.guard';

@Controller('patient/clinics')
export class PatientReviewsController {
  constructor(private readonly reviewsService: PatientReviewsService) {}

  // GET /patient/clinics/:id/reviews
  @Get(':id/reviews')
  async getReviews(@Param('id', ParseIntPipe) clinicId: number) {
    return this.reviewsService.getClinicReviews(clinicId);
  }

  // GET /patient/clinics/:id/my-review
  @Get(':id/my-review')
  @UseGuards(PatientAuthGuard)
  async getMyReview(
    @Param('id', ParseIntPipe) clinicId: number,
    @Request() req: any,
  ) {
    return this.reviewsService.getMyReview(clinicId, req.user.id);
  }

  // POST /patient/clinics/:id/reviews
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

// ─── Doctor Reviews Controller ────────────────────────────────────────────────
@Controller('patient/doctors')
export class PatientDoctorReviewsController {
  constructor(private readonly reviewsService: PatientReviewsService) {}

  // GET /patient/doctors/:doctorId/reviews
  @Get(':doctorId/reviews')
  async getDoctorReviews(@Param('doctorId', ParseIntPipe) doctorId: number) {
    return this.reviewsService.getDoctorReviewsById(doctorId);
  }

  // GET /patient/doctors/:doctorId/my-review
  @Get(':doctorId/my-review')
  @UseGuards(PatientAuthGuard)
  async getMyDoctorReview(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Request() req: any,
  ) {
    return this.reviewsService.getMyDoctorReview(doctorId, req.user.id);
  }

  // POST /patient/doctors/:doctorId/reviews
  @Post(':doctorId/reviews')
  @UseGuards(PatientAuthGuard)
  async submitDoctorReview(
    @Param('doctorId', ParseIntPipe) doctorId: number,
    @Request() req: any,
    @Body() body: { rating: number; comment?: string },
  ) {
    return this.reviewsService.upsertDoctorReview(
      doctorId,
      req.user.id,
      body.rating,
      body.comment,
    );
  }
}
