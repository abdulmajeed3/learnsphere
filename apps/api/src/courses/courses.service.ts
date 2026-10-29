import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseQueryDto } from './dto/course-query.dto';
import { CourseStatus } from '@prisma/client';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: CourseQueryDto) {
    const { search, categoryId, difficulty, page = 1, limit = 12 } = query;
    const skip = (page - 1) * limit;

    const where: any = { status: CourseStatus.PUBLISHED };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoryId) where.categoryId = categoryId;
    if (difficulty) where.difficulty = difficulty;

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        skip,
        take: limit,
        include: {
          instructor: { select: { id: true, name: true, avatarUrl: true } },
          category: { select: { id: true, name: true, slug: true } },
          _count: { select: { lessons: true, enrollments: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      data: courses,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, userId?: string) {
    const course = await this.prisma.course.findUnique({
      where: { id },
      include: {
        instructor: { select: { id: true, name: true, bio: true, avatarUrl: true } },
        category: true,
        lessons: {
          orderBy: { order: 'asc' },
          select: { id: true, title: true, type: true, order: true, duration: true },
        },
        quizzes: { select: { id: true, title: true } },
        _count: { select: { enrollments: true } },
      },
    });
    if (!course) throw new NotFoundException('Course not found');
    if (course.status === CourseStatus.DRAFT && course.instructorId !== userId) {
      throw new NotFoundException('Course not found');
    }
    return course;
  }

  async findBySlug(slug: string, userId?: string) {
    const course = await this.prisma.course.findUnique({
      where: { slug },
      include: {
        instructor: { select: { id: true, name: true, bio: true, avatarUrl: true } },
        category: true,
        lessons: {
          orderBy: { order: 'asc' },
          select: { id: true, title: true, type: true, order: true, duration: true },
        },
        quizzes: { select: { id: true, title: true } },
        _count: { select: { enrollments: true } },
      },
    });
    if (!course) throw new NotFoundException('Course not found');
    if (course.status === CourseStatus.DRAFT && course.instructorId !== userId) {
      throw new NotFoundException('Course not found');
    }
    return course;
  }

  async create(instructorId: string, dto: CreateCourseDto) {
    const slug = this.generateSlug(dto.title);
    const exists = await this.prisma.course.findUnique({ where: { slug } });
    if (exists) throw new ConflictException('A course with this title already exists');

    return this.prisma.course.create({
      data: {
        ...dto,
        slug,
        instructorId,
        objectives: dto.objectives ?? [],
      },
      include: {
        instructor: { select: { id: true, name: true } },
        category: true,
      },
    });
  }

  async update(id: string, instructorId: string, dto: UpdateCourseDto) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    if (course.instructorId !== instructorId) throw new ForbiddenException('Access denied');

    const updateData: any = { ...dto };
    if (dto.title && dto.title !== course.title) {
      updateData.slug = this.generateSlug(dto.title);
    }

    return this.prisma.course.update({
      where: { id },
      data: updateData,
      include: {
        instructor: { select: { id: true, name: true } },
        category: true,
      },
    });
  }

  async remove(id: string, instructorId: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    if (course.instructorId !== instructorId) throw new ForbiddenException('Access denied');
    await this.prisma.course.delete({ where: { id } });
    return { message: 'Course deleted' };
  }

  async publish(id: string, instructorId: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    if (course.instructorId !== instructorId) throw new ForbiddenException('Access denied');
    return this.prisma.course.update({
      where: { id },
      data: { status: CourseStatus.PUBLISHED },
    });
  }

  async unpublish(id: string, instructorId: string) {
    const course = await this.prisma.course.findUnique({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    if (course.instructorId !== instructorId) throw new ForbiddenException('Access denied');
    return this.prisma.course.update({
      where: { id },
      data: { status: CourseStatus.DRAFT },
    });
  }

  async findByInstructor(instructorId: string) {
    return this.prisma.course.findMany({
      where: { instructorId },
      include: {
        category: { select: { id: true, name: true } },
        _count: { select: { lessons: true, enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  private generateSlug(title: string): string {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }
}
