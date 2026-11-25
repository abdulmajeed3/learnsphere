import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async upsert(studentId: string, courseId: string, dto: CreateReviewDto) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });
    if (!enrollment) throw new ForbiddenException('Must be enrolled to review this course');

    return this.prisma.courseReview.upsert({
      where: { studentId_courseId: { studentId, courseId } },
      create: { studentId, courseId, rating: dto.rating, body: dto.body },
      update: { rating: dto.rating, body: dto.body },
      include: { student: { select: { id: true, name: true, avatarUrl: true } } },
    });
  }

  async findByCourse(courseId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');

    const reviews = await this.prisma.courseReview.findMany({
      where: { courseId },
      include: { student: { select: { id: true, name: true, avatarUrl: true } } },
      orderBy: { createdAt: 'desc' },
    });

    const averageRating =
      reviews.length > 0
        ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
        : null;

    return { reviews, averageRating, reviewCount: reviews.length };
  }

  async findMyReview(studentId: string, courseId: string) {
    return this.prisma.courseReview.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });
  }

  async remove(studentId: string, reviewId: string) {
    const review = await this.prisma.courseReview.findUnique({ where: { id: reviewId } });
    if (!review) throw new NotFoundException('Review not found');
    if (review.studentId !== studentId) throw new ForbiddenException('Not your review');

    await this.prisma.courseReview.delete({ where: { id: reviewId } });
    return { message: 'Review deleted' };
  }
}
