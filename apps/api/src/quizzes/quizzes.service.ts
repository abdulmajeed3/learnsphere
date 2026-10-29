import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';

@Injectable()
export class QuizzesService {
  constructor(private prisma: PrismaService) {}

  private async verifyQuizOwnership(quizId: string, instructorId: string) {
    const quiz = await this.prisma.quiz.findUnique({ where: { id: quizId }, include: { course: true } });
    if (!quiz) throw new NotFoundException('Quiz not found');
    if (quiz.course.instructorId !== instructorId) throw new ForbiddenException('Access denied');
    return quiz;
  }

  async findByCourse(courseId: string) {
    return this.prisma.quiz.findMany({
      where: { courseId },
      include: { _count: { select: { questions: true, attempts: true } } },
      orderBy: { createdAt: 'asc' },
    });
  }

  async findOne(quizId: string, userId: string, role: string) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        course: { select: { instructorId: true, status: true } },
        questions: {
          orderBy: { order: 'asc' },
          include: {
            options: {
              select: {
                id: true,
                text: true,
              },
            },
          },
        },
      },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');

    const isInstructor = role === 'INSTRUCTOR' && quiz.course.instructorId === userId;

    if (!isInstructor) {
      const enrollment = await this.prisma.enrollment.findUnique({
        where: { studentId_courseId: { studentId: userId, courseId: quiz.courseId } },
      });
      if (!enrollment) throw new ForbiddenException('Not enrolled in this course');
    }

    if (isInstructor) {
      // Return full data with correct answers for instructor
      const fullQuiz = await this.prisma.quiz.findUnique({
        where: { id: quizId },
        include: {
          questions: {
            orderBy: { order: 'asc' },
            include: { options: true },
          },
        },
      });
      return fullQuiz;
    }

    return quiz;
  }

  async create(instructorId: string, courseId: string, dto: CreateQuizDto) {
    const course = await this.prisma.course.findUnique({ where: { id: courseId } });
    if (!course) throw new NotFoundException('Course not found');
    if (course.instructorId !== instructorId) throw new ForbiddenException('Access denied');

    return this.prisma.quiz.create({
      data: { title: dto.title, description: dto.description, courseId },
    });
  }

  async update(quizId: string, instructorId: string, dto: UpdateQuizDto) {
    await this.verifyQuizOwnership(quizId, instructorId);
    return this.prisma.quiz.update({ where: { id: quizId }, data: dto });
  }

  async remove(quizId: string, instructorId: string) {
    await this.verifyQuizOwnership(quizId, instructorId);
    await this.prisma.quiz.delete({ where: { id: quizId } });
    return { message: 'Quiz deleted' };
  }

  async addQuestion(quizId: string, instructorId: string, dto: CreateQuestionDto) {
    await this.verifyQuizOwnership(quizId, instructorId);
    const max = await this.prisma.quizQuestion.aggregate({ where: { quizId }, _max: { order: true } });
    const order = (max._max.order ?? 0) + 1;

    const correctCount = dto.options.filter((o) => o.isCorrect).length;
    if (correctCount !== 1) throw new BadRequestException('Each question must have exactly one correct answer');

    return this.prisma.quizQuestion.create({
      data: {
        text: dto.text,
        order,
        quizId,
        options: { create: dto.options },
      },
      include: { options: true },
    });
  }

  async updateQuestion(quizId: string, questionId: string, instructorId: string, dto: UpdateQuestionDto) {
    await this.verifyQuizOwnership(quizId, instructorId);
    const question = await this.prisma.quizQuestion.findFirst({ where: { id: questionId, quizId } });
    if (!question) throw new NotFoundException('Question not found');

    if (dto.options) {
      const correctCount = dto.options.filter((o) => o.isCorrect).length;
      if (correctCount !== 1) throw new BadRequestException('Each question must have exactly one correct answer');
      await this.prisma.quizOption.deleteMany({ where: { questionId } });
    }

    return this.prisma.quizQuestion.update({
      where: { id: questionId },
      data: {
        text: dto.text,
        options: dto.options ? { create: dto.options } : undefined,
      },
      include: { options: true },
    });
  }

  async deleteQuestion(quizId: string, questionId: string, instructorId: string) {
    await this.verifyQuizOwnership(quizId, instructorId);
    const question = await this.prisma.quizQuestion.findFirst({ where: { id: questionId, quizId } });
    if (!question) throw new NotFoundException('Question not found');
    await this.prisma.quizQuestion.delete({ where: { id: questionId } });
    return { message: 'Question deleted' };
  }

  async submitAttempt(quizId: string, studentId: string, dto: SubmitAttemptDto) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { studentId, course: { quizzes: { some: { id: quizId } } } },
    });
    if (!enrollment) throw new ForbiddenException('Not enrolled in this course');

    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { questions: { include: { options: true } } },
    });
    if (!quiz) throw new NotFoundException('Quiz not found');
    if (quiz.questions.length === 0) throw new BadRequestException('Quiz has no questions');

    const questionIds = new Set(quiz.questions.map((q) => q.id));
    for (const answer of dto.answers) {
      if (!questionIds.has(answer.questionId)) throw new BadRequestException(`Invalid question: ${answer.questionId}`);
      const question = quiz.questions.find((q) => q.id === answer.questionId)!;
      const optionIds = new Set(question.options.map((o) => o.id));
      if (answer.selectedOptionId && !optionIds.has(answer.selectedOptionId)) {
        throw new BadRequestException(`Invalid option for question: ${answer.questionId}`);
      }
    }

    let score = 0;
    const answerData = dto.answers.map((answer) => {
      const question = quiz.questions.find((q) => q.id === answer.questionId)!;
      const selectedOption = answer.selectedOptionId
        ? question.options.find((o) => o.id === answer.selectedOptionId)
        : null;
      const isCorrect = selectedOption?.isCorrect ?? false;
      if (isCorrect) score++;
      return {
        questionId: answer.questionId,
        selectedOptionId: answer.selectedOptionId ?? null,
        isCorrect,
      };
    });

    const attempt = await this.prisma.quizAttempt.create({
      data: {
        studentId,
        quizId,
        score,
        totalPoints: quiz.questions.length,
        answers: { create: answerData },
      },
      include: {
        answers: {
          include: {
            question: { select: { text: true } },
            selectedOption: { select: { text: true } },
          },
        },
      },
    });

    return { ...attempt, percentageScore: Math.round((score / quiz.questions.length) * 100) };
  }

  async getAttempts(quizId: string, studentId: string) {
    return this.prisma.quizAttempt.findMany({
      where: { quizId, studentId },
      include: {
        answers: {
          include: {
            question: { select: { text: true } },
            selectedOption: { select: { text: true } },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
    });
  }

  async getInstructorStats(quizId: string, instructorId: string) {
    await this.verifyQuizOwnership(quizId, instructorId);
    const attempts = await this.prisma.quizAttempt.findMany({
      where: { quizId },
      select: { score: true, totalPoints: true, submittedAt: true },
    });

    if (attempts.length === 0) return { totalAttempts: 0, averageScore: 0, averagePercentage: 0 };

    const avg = attempts.reduce((sum, a) => sum + (a.score / a.totalPoints) * 100, 0) / attempts.length;
    return {
      totalAttempts: attempts.length,
      averageScore: attempts.reduce((s, a) => s + a.score, 0) / attempts.length,
      averagePercentage: Math.round(avg),
    };
  }
}
