import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStudentDashboard(studentId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          include: {
            instructor: { select: { id: true, name: true, avatarUrl: true } },
            category: { select: { name: true } },
            _count: { select: { lessons: true } },
          },
        },
        progress: { select: { lessonId: true, completedAt: true } },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    const coursesWithProgress = enrollments.map((e) => {
      const total = e.course._count.lessons;
      const completed = e.progress.length;
      return {
        enrollmentId: e.id,
        courseId: e.course.id,
        courseTitle: e.course.title,
        instructor: e.course.instructor,
        category: e.course.category?.name,
        enrolledAt: e.enrolledAt,
        totalLessons: total,
        completedLessons: completed,
        progressPercentage: total > 0 ? Math.round((completed / total) * 100) : 0,
      };
    });

    const recentAttempts = await this.prisma.quizAttempt.findMany({
      where: { studentId },
      include: {
        quiz: { select: { title: true, courseId: true, course: { select: { title: true } } } },
      },
      orderBy: { submittedAt: 'desc' },
      take: 5,
    });

    const totalCompletedLessons = enrollments.reduce((sum, e) => sum + e.progress.length, 0);
    const completedCourses = coursesWithProgress.filter((c) => c.progressPercentage === 100).length;

    return {
      totalEnrollments: enrollments.length,
      completedCourses,
      totalCompletedLessons,
      courses: coursesWithProgress,
      recentQuizAttempts: recentAttempts.map((a) => ({
        id: a.id,
        quizTitle: a.quiz.title,
        courseTitle: a.quiz.course.title,
        score: a.score,
        totalPoints: a.totalPoints,
        percentage: Math.round((a.score / a.totalPoints) * 100),
        submittedAt: a.submittedAt,
      })),
    };
  }

  async getInstructorDashboard(instructorId: string) {
    const courses = await this.prisma.course.findMany({
      where: { instructorId },
      include: {
        _count: { select: { lessons: true, enrollments: true } },
        quizzes: { include: { _count: { select: { attempts: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const published = courses.filter((c) => c.status === 'PUBLISHED');
    const draft = courses.filter((c) => c.status === 'DRAFT');
    const totalEnrollments = courses.reduce((sum, c) => sum + c._count.enrollments, 0);
    const totalQuizAttempts = courses
      .flatMap((c) => c.quizzes)
      .reduce((sum, q) => sum + q._count.attempts, 0);

    return {
      totalCourses: courses.length,
      publishedCourses: published.length,
      draftCourses: draft.length,
      totalEnrollments,
      totalQuizAttempts,
      courses: courses.map((c) => ({
        id: c.id,
        title: c.title,
        status: c.status,
        difficulty: c.difficulty,
        lessonCount: c._count.lessons,
        enrollmentCount: c._count.enrollments,
        quizCount: c.quizzes.length,
        createdAt: c.createdAt,
      })),
    };
  }
}
