import { Controller, Post, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('progress')
@Controller('progress')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STUDENT')
@ApiBearerAuth()
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  @Post(':lessonId/complete')
  @ApiOperation({ summary: 'Mark lesson as complete' })
  markComplete(@CurrentUser() user: any, @Param('lessonId') lessonId: string) {
    return this.progressService.markComplete(user.id, lessonId);
  }

  @Delete(':lessonId/complete')
  @ApiOperation({ summary: 'Mark lesson as incomplete' })
  markIncomplete(@CurrentUser() user: any, @Param('lessonId') lessonId: string) {
    return this.progressService.markIncomplete(user.id, lessonId);
  }

  @Get('courses/:courseId')
  @ApiOperation({ summary: 'Get progress for a course' })
  getCourseProgress(@CurrentUser() user: any, @Param('courseId') courseId: string) {
    return this.progressService.getCourseProgress(user.id, courseId);
  }
}
