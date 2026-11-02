import { Test } from '@nestjs/testing';
import { NotesService } from './notes.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

const mockPrisma = {
  lesson: { findUnique: jest.fn() },
  enrollment: { findUnique: jest.fn() },
  lessonNote: {
    findMany: jest.fn(),
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('NotesService', () => {
  let service: NotesService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [NotesService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();
    service = module.get<NotesService>(NotesService);
    jest.clearAllMocks();
  });

  it('should throw NotFoundException when lesson does not exist', async () => {
    mockPrisma.lesson.findUnique.mockResolvedValue(null);
    await expect(service.listForLesson('student1', 'lesson1')).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException when student not enrolled', async () => {
    mockPrisma.lesson.findUnique.mockResolvedValue({ id: 'lesson1', courseId: 'course1' });
    mockPrisma.enrollment.findUnique.mockResolvedValue(null);
    await expect(service.listForLesson('student1', 'lesson1')).rejects.toThrow(ForbiddenException);
  });

  it('should create a note when enrolled', async () => {
    mockPrisma.lesson.findUnique.mockResolvedValue({ id: 'lesson1', courseId: 'course1' });
    mockPrisma.enrollment.findUnique.mockResolvedValue({ id: 'e1' });
    mockPrisma.lessonNote.create.mockResolvedValue({
      id: 'n1',
      content: 'hello',
      studentId: 'student1',
      lessonId: 'lesson1',
    });
    const result = await service.create('student1', 'lesson1', { content: 'hello' });
    expect(result).toHaveProperty('id', 'n1');
  });

  it('should throw ForbiddenException when updating another student note', async () => {
    mockPrisma.lessonNote.findUnique.mockResolvedValue({ id: 'n1', studentId: 'other' });
    await expect(service.update('student1', 'n1', { content: 'x' })).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should throw NotFoundException when deleting non-existent note', async () => {
    mockPrisma.lessonNote.findUnique.mockResolvedValue(null);
    await expect(service.delete('student1', 'n1')).rejects.toThrow(NotFoundException);
  });
});
