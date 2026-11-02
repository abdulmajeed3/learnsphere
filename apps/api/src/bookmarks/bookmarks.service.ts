import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarksService {
  constructor(private prisma: PrismaService) {}

  async addBookmark(studentId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');

    const existing = await this.prisma.courseBookmark.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });
    if (existing) throw new ConflictException('Already bookmarked');

    return this.prisma.courseBookmark.create({
      data: { studentId, courseId },
      include: {
        course: {
          include: {
            instructor: { select: { id: true, name: true } },
            category: { select: { id: true, name: true } },
            _count: { select: { lessons: true, enrollments: true } },
          },
        },
      },
    });
  }

  async removeBookmark(studentId: string, courseId: string) {
    const bookmark = await this.prisma.courseBookmark.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });
    if (!bookmark) throw new NotFoundException('Bookmark not found');

    await this.prisma.courseBookmark.delete({ where: { id: bookmark.id } });
    return { message: 'Bookmark removed' };
  }

  async listBookmarks(studentId: string) {
    const bookmarks = await this.prisma.courseBookmark.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            instructor: { select: { id: true, name: true, avatarUrl: true } },
            category: { select: { id: true, name: true } },
            _count: { select: { lessons: true, enrollments: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return bookmarks;
  }

  async checkBookmark(studentId: string, courseId: string) {
    return this.prisma.courseBookmark.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });
  }
}
