import { Test } from '@nestjs/testing';
import { BookmarksService } from './bookmarks.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ConflictException } from '@nestjs/common';

const mockPrisma = {
  course: { findUnique: jest.fn() },
  courseBookmark: {
    findUnique: jest.fn(),
    create: jest.fn(),
    delete: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('BookmarksService', () => {
  let service: BookmarksService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [BookmarksService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<BookmarksService>(BookmarksService);
    jest.clearAllMocks();
  });

  it('should throw NotFoundException when course does not exist', async () => {
    mockPrisma.course.findUnique.mockResolvedValue(null);
    await expect(service.addBookmark('student1', 'course1')).rejects.toThrow(NotFoundException);
  });

  it('should throw ConflictException on duplicate bookmark', async () => {
    mockPrisma.course.findUnique.mockResolvedValue({ id: 'course1' });
    mockPrisma.courseBookmark.findUnique.mockResolvedValue({ id: 'b1' });
    await expect(service.addBookmark('student1', 'course1')).rejects.toThrow(ConflictException);
  });

  it('should create a bookmark', async () => {
    mockPrisma.course.findUnique.mockResolvedValue({ id: 'course1' });
    mockPrisma.courseBookmark.findUnique.mockResolvedValue(null);
    mockPrisma.courseBookmark.create.mockResolvedValue({
      id: 'b1',
      studentId: 'student1',
      courseId: 'course1',
    });
    const result = await service.addBookmark('student1', 'course1');
    expect(result).toHaveProperty('id', 'b1');
  });

  it('should throw NotFoundException when removing non-existent bookmark', async () => {
    mockPrisma.courseBookmark.findUnique.mockResolvedValue(null);
    await expect(service.removeBookmark('student1', 'course1')).rejects.toThrow(NotFoundException);
  });
});
