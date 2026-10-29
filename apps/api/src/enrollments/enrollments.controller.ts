import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { EnrollDto } from './dto/enroll.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('enrollments')
@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class EnrollmentsController {
  constructor(private enrollmentsService: EnrollmentsService) {}

  @Post()
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Enroll in a course' })
  enroll(@CurrentUser() user: any, @Body() dto: EnrollDto) {
    return this.enrollmentsService.enroll(user.id, dto);
  }

  @Get()
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Get enrolled courses' })
  findAll(@CurrentUser() user: any) {
    return this.enrollmentsService.findByStudent(user.id);
  }

  @Get(':id')
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Get single enrollment' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.enrollmentsService.findOne(id, user.id);
  }

  @Get('check/:courseId')
  @ApiOperation({ summary: 'Check if enrolled in course' })
  checkEnrollment(@Param('courseId') courseId: string, @CurrentUser() user: any) {
    return this.enrollmentsService.checkEnrollment(user.id, courseId);
  }
}
