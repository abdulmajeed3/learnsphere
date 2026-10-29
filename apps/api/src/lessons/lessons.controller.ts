import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { ReorderLessonsDto } from './dto/reorder-lessons.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';

@ApiTags('lessons')
@Controller('courses/:courseId/lessons')
export class LessonsController {
  constructor(private lessonsService: LessonsService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({ summary: 'Get lessons for a course' })
  findAll(@Param('courseId') courseId: string, @CurrentUser() user?: any) {
    return this.lessonsService.findByCourse(courseId, user?.id);
  }

  @Get(':lessonId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get a single lesson' })
  findOne(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: any,
  ) {
    return this.lessonsService.findOne(courseId, lessonId, user.id);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('INSTRUCTOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create lesson' })
  create(
    @Param('courseId') courseId: string,
    @CurrentUser() user: any,
    @Body() dto: CreateLessonDto,
  ) {
    return this.lessonsService.create(courseId, user.id, dto);
  }

  @Patch('reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('INSTRUCTOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Reorder lessons' })
  reorder(
    @Param('courseId') courseId: string,
    @CurrentUser() user: any,
    @Body() dto: ReorderLessonsDto,
  ) {
    return this.lessonsService.reorder(courseId, user.id, dto);
  }

  @Patch(':lessonId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('INSTRUCTOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update lesson' })
  update(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateLessonDto,
  ) {
    return this.lessonsService.update(courseId, lessonId, user.id, dto);
  }

  @Delete(':lessonId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('INSTRUCTOR')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete lesson' })
  remove(
    @Param('courseId') courseId: string,
    @Param('lessonId') lessonId: string,
    @CurrentUser() user: any,
  ) {
    return this.lessonsService.remove(courseId, lessonId, user.id);
  }
}
