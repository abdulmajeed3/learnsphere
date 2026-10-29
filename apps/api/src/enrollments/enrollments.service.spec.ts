import { Test } from '@nestjs/testing';
import { EnrollmentsService } from './enrollments.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';

const mockPrisma = {
  course: { findUnique: jest.fn() },
  enrollment: { findUnique: jest.fn(), create: jest.fn(), findMany: jest.fn() },
};

describe('EnrollmentsService', () => {
  let service: EnrollmentsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EnrollmentsService,
        { provide: PrismaService, useValue: mockPrisma },
      ],
    }).compile();
    service = module.get<EnrollmentsService>(EnrollmentsService);
    jest.clearAllMocks();
  });

  it('should throw NotFoundException for unknown course', async () => {
    mockPrisma.course.findUnique.mockResolvedValue(null);
    await expect(service.enroll('student1', { courseId: 'x' })).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException for draft course', async () => {
    mockPrisma.course.findUnique.mockResolvedValue({ id: 'c1', status: 'DRAFT' });
    await expect(service.enroll('student1', { courseId: 'c1' })).rejects.toThrow(BadRequestException);
  });

  it('should throw ConflictException for duplicate enrollment', async () => {
    mockPrisma.course.findUnique.mockResolvedValue({ id: 'c1', status: 'PUBLISHED' });
    mockPrisma.enrollment.findUnique.mockResolvedValue({ id: 'e1' });
    await expect(service.enroll('student1', { courseId: 'c1' })).rejects.toThrow(ConflictException);
  });
});
