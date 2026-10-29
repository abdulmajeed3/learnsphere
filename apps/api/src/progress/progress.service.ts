import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  private async getEnrollmentForLesson(studentId: string, lessonId: string) {
    const lesson = await this.prisma.lesson.findUnique({ where: { id: lessonId } });
    if (!lesson) throw new NotFoundException('Lesson not found');

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId: lesson.courseId } },
    });
    if (!enrollment) throw new ForbiddenException('Not enrolled in this course');
    return enrollment;
  }

  async markComplete(studentId: string, lessonId: string) {
    const enrollment = await this.getEnrollmentForLesson(studentId, lessonId);

    return this.prisma.lessonProgress.upsert({
      where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId } },
      create: { enrollmentId: enrollment.id, lessonId },
      update: { completedAt: new Date() },
    });
  }

  async markIncomplete(studentId: string, lessonId: string) {
    const enrollment = await this.getEnrollmentForLesson(studentId, lessonId);

    const progress = await this.prisma.lessonProgress.findUnique({
      where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId } },
    });
    if (!progress) return { message: 'Progress not found' };

    await this.prisma.lessonProgress.delete({ where: { id: progress.id } });
    return { message: 'Lesson marked incomplete' };
  }

  async getCourseProgress(studentId: string, courseId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
      include: { progress: { select: { lessonId: true } } },
    });
    if (!enrollment) throw new NotFoundException('Not enrolled');

    const totalLessons = await this.prisma.lesson.count({ where: { courseId } });
    const completedLessons = enrollment.progress.length;
    const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

    return {
      enrollmentId: enrollment.id,
      courseId,
      completedLessonIds: enrollment.progress.map((p) => p.lessonId),
      completedLessons,
      totalLessons,
      progressPercentage: percentage,
    };
  }
}
