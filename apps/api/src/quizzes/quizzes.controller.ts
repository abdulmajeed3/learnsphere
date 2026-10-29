import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { QuizzesService } from './quizzes.service';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { SubmitAttemptDto } from './dto/submit-attempt.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('quizzes')
@Controller('quizzes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class QuizzesController {
  constructor(private quizzesService: QuizzesService) {}

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Get quizzes for a course' })
  findByCourse(@Param('courseId') courseId: string) {
    return this.quizzesService.findByCourse(courseId);
  }

  @Get(':quizId')
  @ApiOperation({ summary: 'Get quiz with questions (correct answers hidden from students)' })
  findOne(@Param('quizId') quizId: string, @CurrentUser() user: any) {
    return this.quizzesService.findOne(quizId, user.id, user.role);
  }

  @Post('course/:courseId')
  @UseGuards(RolesGuard)
  @Roles('INSTRUCTOR')
  @ApiOperation({ summary: 'Create a quiz' })
  create(@Param('courseId') courseId: string, @CurrentUser() user: any, @Body() dto: CreateQuizDto) {
    return this.quizzesService.create(user.id, courseId, dto);
  }

  @Patch(':quizId')
  @UseGuards(RolesGuard)
  @Roles('INSTRUCTOR')
  @ApiOperation({ summary: 'Update quiz' })
  update(@Param('quizId') quizId: string, @CurrentUser() user: any, @Body() dto: UpdateQuizDto) {
    return this.quizzesService.update(quizId, user.id, dto);
  }

  @Delete(':quizId')
  @UseGuards(RolesGuard)
  @Roles('INSTRUCTOR')
  @ApiOperation({ summary: 'Delete quiz' })
  remove(@Param('quizId') quizId: string, @CurrentUser() user: any) {
    return this.quizzesService.remove(quizId, user.id);
  }

  @Post(':quizId/questions')
  @UseGuards(RolesGuard)
  @Roles('INSTRUCTOR')
  @ApiOperation({ summary: 'Add question to quiz' })
  addQuestion(@Param('quizId') quizId: string, @CurrentUser() user: any, @Body() dto: CreateQuestionDto) {
    return this.quizzesService.addQuestion(quizId, user.id, dto);
  }

  @Patch(':quizId/questions/:questionId')
  @UseGuards(RolesGuard)
  @Roles('INSTRUCTOR')
  @ApiOperation({ summary: 'Update question' })
  updateQuestion(@Param('quizId') quizId: string, @Param('questionId') questionId: string, @CurrentUser() user: any, @Body() dto: UpdateQuestionDto) {
    return this.quizzesService.updateQuestion(quizId, questionId, user.id, dto);
  }

  @Delete(':quizId/questions/:questionId')
  @UseGuards(RolesGuard)
  @Roles('INSTRUCTOR')
  @ApiOperation({ summary: 'Delete question' })
  deleteQuestion(@Param('quizId') quizId: string, @Param('questionId') questionId: string, @CurrentUser() user: any) {
    return this.quizzesService.deleteQuestion(quizId, questionId, user.id);
  }

  @Post(':quizId/attempt')
  @UseGuards(RolesGuard)
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Submit quiz attempt' })
  submitAttempt(@Param('quizId') quizId: string, @CurrentUser() user: any, @Body() dto: SubmitAttemptDto) {
    return this.quizzesService.submitAttempt(quizId, user.id, dto);
  }

  @Get(':quizId/attempts')
  @UseGuards(RolesGuard)
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Get my quiz attempts' })
  getAttempts(@Param('quizId') quizId: string, @CurrentUser() user: any) {
    return this.quizzesService.getAttempts(quizId, user.id);
  }

  @Get(':quizId/stats')
  @UseGuards(RolesGuard)
  @Roles('INSTRUCTOR')
  @ApiOperation({ summary: 'Get quiz statistics' })
  getStats(@Param('quizId') quizId: string, @CurrentUser() user: any) {
    return this.quizzesService.getInstructorStats(quizId, user.id);
  }
}
