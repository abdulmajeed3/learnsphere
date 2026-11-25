import { Test, TestingModule } from '@nestjs/testing';
import { ReviewsService } from './reviews.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

const mockPrisma = {
  course: { findUnique: jest.fn() },
  enrollment: { findUnique: jest.fn() },
  courseReview: {
    upsert: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
};

describe('ReviewsService', () => {
  let service: ReviewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReviewsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();

    service = module.get<ReviewsService>(ReviewsService);
    jest.clearAllMocks();
  });

  describe('upsert', () => {
    it('throws NotFoundException when course not found', async () => {
      mockPrisma.course.findUnique.mockResolvedValue(null);
      await expect(
        service.upsert('student-1', 'course-1', { rating: 4 }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when not enrolled', async () => {
      mockPrisma.course.findUnique.mockResolvedValue({ id: 'course-1' });
      mockPrisma.enrollment.findUnique.mockResolvedValue(null);
      await expect(
        service.upsert('student-1', 'course-1', { rating: 4 }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('creates or updates review when enrolled', async () => {
      mockPrisma.course.findUnique.mockResolvedValue({ id: 'course-1' });
      mockPrisma.enrollment.findUnique.mockResolvedValue({ id: 'enroll-1' });
      const review = { id: 'rev-1', rating: 4, body: null };
      mockPrisma.courseReview.upsert.mockResolvedValue(review);

      const result = await service.upsert('student-1', 'course-1', { rating: 4 });
      expect(result).toEqual(review);
      expect(mockPrisma.courseReview.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { studentId_courseId: { studentId: 'student-1', courseId: 'course-1' } },
        }),
      );
    });
  });

  describe('findByCourse', () => {
    it('throws NotFoundException when course not found', async () => {
      mockPrisma.course.findUnique.mockResolvedValue(null);
      await expect(service.findByCourse('course-1')).rejects.toThrow(NotFoundException);
    });

    it('returns reviews with computed average', async () => {
      mockPrisma.course.findUnique.mockResolvedValue({ id: 'course-1' });
      mockPrisma.courseReview.findMany.mockResolvedValue([
        { id: 'r1', rating: 4 },
        { id: 'r2', rating: 5 },
      ]);

      const result = await service.findByCourse('course-1');
      expect(result.averageRating).toBe(4.5);
      expect(result.reviewCount).toBe(2);
    });

    it('returns null averageRating when no reviews', async () => {
      mockPrisma.course.findUnique.mockResolvedValue({ id: 'course-1' });
      mockPrisma.courseReview.findMany.mockResolvedValue([]);

      const result = await service.findByCourse('course-1');
      expect(result.averageRating).toBeNull();
      expect(result.reviewCount).toBe(0);
    });
  });

  describe('remove', () => {
    it('throws NotFoundException when review not found', async () => {
      mockPrisma.courseReview.findUnique.mockResolvedValue(null);
      await expect(service.remove('student-1', 'rev-1')).rejects.toThrow(NotFoundException);
    });

    it('throws ForbiddenException when not owner', async () => {
      mockPrisma.courseReview.findUnique.mockResolvedValue({
        id: 'rev-1',
        studentId: 'other-student',
      });
      await expect(service.remove('student-1', 'rev-1')).rejects.toThrow(ForbiddenException);
    });

    it('deletes review when owner', async () => {
      mockPrisma.courseReview.findUnique.mockResolvedValue({
        id: 'rev-1',
        studentId: 'student-1',
      });
      mockPrisma.courseReview.delete.mockResolvedValue({});

      const result = await service.remove('student-1', 'rev-1');
      expect(result).toEqual({ message: 'Review deleted' });
    });
  });
});
