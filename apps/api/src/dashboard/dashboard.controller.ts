import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private dashboardService: DashboardService) {}

  @Get('student')
  @UseGuards(RolesGuard)
  @Roles('STUDENT')
  @ApiOperation({ summary: 'Get student dashboard data' })
  getStudentDashboard(@CurrentUser() user: any) {
    return this.dashboardService.getStudentDashboard(user.id);
  }

  @Get('instructor')
  @UseGuards(RolesGuard)
  @Roles('INSTRUCTOR')
  @ApiOperation({ summary: 'Get instructor dashboard data' })
  getInstructorDashboard(@CurrentUser() user: any) {
    return this.dashboardService.getInstructorDashboard(user.id);
  }
}
