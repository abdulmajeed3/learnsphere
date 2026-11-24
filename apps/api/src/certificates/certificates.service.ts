import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CertificatesService {
  constructor(private prisma: PrismaService) {}

  async claim(studentId: string, courseId: string) {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: { select: { id: true, name: true } },
        _count: { select: { lessons: true } },
      },
    });
    if (!course) throw new NotFoundException('Course not found');

    const enrollment = await this.prisma.enrollment.findUnique({
      where: { studentId_courseId: { studentId, courseId } },
      include: { progress: { select: { lessonId: true } } },
    });
    if (!enrollment) throw new ForbiddenException('Not enrolled in this course');

    const totalLessons = course._count.lessons;
    if (totalLessons === 0) throw new BadRequestException('Course has no lessons');

    const completedLessons = enrollment.progress.length;
    if (completedLessons < totalLessons) {
      throw new BadRequestException(
        `Complete all lessons first (${completedLessons}/${totalLessons} done)`,
      );
    }

    return this.prisma.certificate.upsert({
      where: { studentId_courseId: { studentId, courseId } },
      create: { studentId, courseId },
      update: {},
      include: {
        course: { include: { instructor: { select: { id: true, name: true } } } },
        student: { select: { id: true, name: true } },
      },
    });
  }

  async listMyCertificates(studentId: string) {
    return this.prisma.certificate.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            instructor: { select: { id: true, name: true } },
            category: { select: { name: true } },
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async verifyByCode(code: string) {
    const cert = await this.prisma.certificate.findUnique({
      where: { code },
      include: {
        course: { include: { instructor: { select: { id: true, name: true } } } },
        student: { select: { id: true, name: true } },
      },
    });
    if (!cert) throw new NotFoundException('Certificate not found');
    return cert;
  }
}
