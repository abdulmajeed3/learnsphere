import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(private prisma: PrismaService) {}

  private async assertEnrolled(studentId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) throw new NotFoundException('Lesson not found');

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId: lesson.courseId } },
    });
    if (!enrollment) throw new ForbiddenException('Not enrolled in this course');
  }

  async listForLesson(studentId: string, lessonId: string) {
    await this.assertEnrolled(studentId, lessonId);
    return this.prisma.lessonNote.findMany({
      where: { studentId, lessonId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async create(studentId: string, lessonId: string, dto: CreateNoteDto) {
    await this.assertEnrolled(studentId, lessonId);
    return this.prisma.lessonNote.create({
      data: { studentId, lessonId, content: dto.content },
    });
  }

  async update(studentId: string, noteId: string, dto: UpdateNoteDto) {
    const note = await this.prisma.lessonNote.findUnique({ where: { id: noteId } });
    if (!note) throw new NotFoundException('Note not found');
    if (note.studentId !== studentId) throw new ForbiddenException('Not your note');

    return this.prisma.lessonNote.update({
      where: { id: noteId },
      data: { content: dto.content },
    });
  }

  async delete(studentId: string, noteId: string) {
    const note = await this.prisma.lessonNote.findUnique({ where: { id: noteId } });
    if (!note) throw new NotFoundException('Note not found');
    if (note.studentId !== studentId) throw new ForbiddenException('Not your note');

    await this.prisma.lessonNote.delete({ where: { id: noteId } });
    return { message: 'Note deleted' };
  }
}
