import { Test } from '@nestjs/testing';
import { ProgressService } from './progress.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrisma = {
  lesson: { findUnique: jest.fn() },
  enrollment: { findUnique: jest.fn() },
  lessonProgress: { upsert: jest.fn(), findUnique: jest.fn(), delete: jest.fn() },
};

describe('ProgressService', () => {
  let service: ProgressService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ProgressService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<ProgressService>(ProgressService);
    jest.clearAllMocks();
  });

  it('should mark lesson complete', async () => {
    mockPrisma.lesson.findUnique.mockResolvedValue({ id: 'l1', courseId: 'c1' });
    mockPrisma.enrollment.findUnique.mockResolvedValue({ id: 'e1' });
    mockPrisma.lessonProgress.upsert.mockResolvedValue({ id: 'p1', lessonId: 'l1' });
    const result = await service.markComplete('student1', 'l1');
    expect(result.lessonId).toBe('l1');
  });
});
