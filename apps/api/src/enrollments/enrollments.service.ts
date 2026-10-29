import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EnrollDto } from './dto/enroll.dto';
import { CourseStatus } from '@prisma/client';

@Injectable()
export class EnrollmentsService {
  constructor(private prisma: PrismaService) {}

  async enroll(studentId: string, dto: EnrollDto) {
    const course = await this.prisma.course.findUnique({ where: { id: dto.courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (course.status !== CourseStatus.PUBLISHED) throw new BadRequestException('Cannot enroll in unpublished course');

    const existing = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId: dto.courseId } },
    });
    if (existing) throw new ConflictException('Already enrolled');

    return this.prisma.enrollment.create({
      data: { studentId, courseId: dto.courseId },
      include: { course: { include: { instructor: { select: { id: true, name: true } }, category: true } } },
    });
  }

  async findByStudent(studentId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            instructor: { select: { id: true, name: true, avatarUrl: true } },
            category: { select: { id: true, name: true } },
            _count: { select: { lessons: true } },
          },
        },
        progress: { select: { lessonId: true } },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    return enrollments.map((e) => {
      const totalLessons = e.course._count.lessons;
      const completedLessons = e.progress.length;
      const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
      return {
        ...e,
        progress: undefined,
        completedLessons,
        totalLessons,
        progressPercentage: percentage,
      };
    });
  }

  async findOne(enrollmentId: string, studentId: string) {
    const enrollment = await this.prisma.enrollment.findUnique({
      where: { id: enrollmentId },
      include: {
        course: {
          include: {
            instructor: { select: { id: true, name: true } },
            lessons: { orderBy: { order: 'asc' } },
          },
        },
        progress: { select: { lessonId: true } },
      },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    if (enrollment.studentId !== studentId) throw new NotFoundException('Enrollment not found');
    return enrollment;
  }

  async checkEnrollment(studentId: string, courseId: string) {
    return this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
    });
  }
}
