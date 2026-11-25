import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private reviewsService: ReviewsService) {}

  @Post(':courseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create or update a review for a course' })
  upsert(
    @CurrentUser() user: any,
    @Param('courseId') courseId: string,
    @Body() dto: CreateReviewDto,
  ) {
    return this.reviewsService.upsert(user.id, courseId, dto);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get all reviews for a course' })
  findByCourse(@Param('courseId') courseId: string) {
    return this.reviewsService.findByCourse(courseId);
  }

  @Get('my/:courseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my review for a course' })
  findMine(@CurrentUser() user: any, @Param('courseId') courseId: string) {
    return this.reviewsService.findMyReview(user.id, courseId);
  }

  @Delete(':reviewId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a review' })
  remove(@CurrentUser() user: any, @Param('reviewId') reviewId: string) {
    return this.reviewsService.remove(user.id, reviewId);
  }
}
