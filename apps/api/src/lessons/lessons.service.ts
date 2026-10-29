import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ReorderLessonsDto } from './dto/reorder-lessons.dto';

@Injectable()
export class LessonsService {
  constructor(private prisma: PrismaService) {}

  private async verifyCourseOwnership(courseId: string, instructorId: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (course.instructorId !== instructorId) throw new ForbiddenException('Access denied');
    return course;
  }

  async findByCourse(courseId: string, userId?: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');

    const isInstructor = course.instructorId === userId;

    if (!isInstructor && course.status === 'DRAFT') throw new NotFoundException('Course not found');

    if (!isInstructor && userId) {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId: userId, courseId } },
      });
      if (!enrollment) throw new ForbiddenException('Enroll to access lessons');
    }

    return this.prisma.lesson.findMany({
      where: { courseId },
      orderBy: { order: 'asc' },
    });
  }

  async findOne(courseId: string, lessonId: string, userId?: string) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');

    const isInstructor = course.instructorId === userId;

    if (!isInstructor && userId) {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId: userId, courseId } },
      });
      if (!enrollment) throw new ForbiddenException('Enroll to access lessons');
    }

    const lesson = await this.prisma.lesson.findFirst({
      where: { id: lessonId, courseId },
    });
    if (!lesson) throw new NotFoundException('Lesson not found');
    return lesson;
  }

  async create(courseId: string, instructorId: string, dto: CreateLessonDto) {
    await this.verifyCourseOwnership(courseId, instructorId);
    const max = await this.prisma.lesson.aggregate({ where: { courseId }, _max: { order: true } });
    const order = (max._max.order ?? 0) + 1;
    return this.prisma.lesson.create({ data: { ...dto, courseId, order } });
  }

  async update(courseId: string, lessonId: string, instructorId: string, dto: UpdateLessonDto) {
    await this.verifyCourseOwnership(courseId, instructorId);
    const lesson = await this.prisma.lesson.findFirst({ where: { id: lessonId, courseId } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    return this.prisma.lesson.update({ where: { id: lessonId }, data: dto });
  }

  async remove(courseId: string, lessonId: string, instructorId: string) {
    await this.verifyCourseOwnership(courseId, instructorId);
    const lesson = await this.prisma.lesson.findFirst({ where: { id: lessonId, courseId } });
    if (!lesson) throw new NotFoundException('Lesson not found');
    await this.prisma.lesson.delete({ where: { id: lessonId } });
    return { message: 'Lesson deleted' };
  }

  async reorder(courseId: string, instructorId: string, dto: ReorderLessonsDto) {
    await this.verifyCourseOwnership(courseId, instructorId);
    await this.prisma.$transaction(
      dto.lessonIds.map((id, index) =>
        this.prisma.lesson.update({ where: { id }, data: { order: index + 1 } }),
      ),
    );
    return this.prisma.lesson.findMany({ where: { courseId }, orderBy: { order: 'asc' } });
  }
}
