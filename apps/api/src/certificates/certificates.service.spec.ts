import { Test } from '@nestjs/testing';
import { CertificatesService } from './certificates.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';

const mockPrisma = {
  course: { findUnique: jest.fn() },
  enrollment: { findUnique: jest.fn() },
  certificate: { upsert: jest.fn(), findMany: jest.fn(), findUnique: jest.fn() },
};

describe('CertificatesService', () => {
  let service: CertificatesService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [CertificatesService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<CertificatesService>(CertificatesService);
    jest.clearAllMocks();
  });

  it('should throw NotFoundException for unknown course', async () => {
    mockPrisma.course.findUnique.mockResolvedValue(null);
    await expect(service.claim('student1', 'course1')).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException when not enrolled', async () => {
    mockPrisma.course.findUnique.mockResolvedValue({ id: 'course1', _count: { lessons: 3 } });
    mockPrisma.enrollment.findUnique.mockResolvedValue(null);
    await expect(service.claim('student1', 'course1')).rejects.toThrow(ForbiddenException);
  });

  it('should throw BadRequestException when course has no lessons', async () => {
    mockPrisma.course.findUnique.mockResolvedValue({ id: 'course1', _count: { lessons: 0 } });
    mockPrisma.enrollment.findUnique.mockResolvedValue({ id: 'e1', progress: [] });
    await expect(service.claim('student1', 'course1')).rejects.toThrow(BadRequestException);
  });

  it('should throw BadRequestException when not all lessons completed', async () => {
    mockPrisma.course.findUnique.mockResolvedValue({ id: 'course1', _count: { lessons: 3 } });
    mockPrisma.enrollment.findUnique.mockResolvedValue({
      id: 'e1',
      progress: [{ lessonId: 'l1' }],
    });
    await expect(service.claim('student1', 'course1')).rejects.toThrow(BadRequestException);
  });

  it('should return certificate when course is 100% complete', async () => {
    mockPrisma.course.findUnique.mockResolvedValue({ id: 'course1', _count: { lessons: 2 } });
    mockPrisma.enrollment.findUnique.mockResolvedValue({
      id: 'e1',
      progress: [{ lessonId: 'l1' }, { lessonId: 'l2' }],
    });
    const cert = { id: 'c1', code: 'abc', studentId: 'student1', courseId: 'course1' };
    mockPrisma.certificate.upsert.mockResolvedValue(cert);
    const result = await service.claim('student1', 'course1');
    expect(result).toHaveProperty('code', 'abc');
  });

  it('should throw NotFoundException for invalid verification code', async () => {
    mockPrisma.certificate.findUnique.mockResolvedValue(null);
    await expect(service.verifyByCode('bad-code')).rejects.toThrow(NotFoundException);
  });
});
