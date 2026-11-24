import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { CertificatesService } from './certificates.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('certificates')
@Controller('certificates')
export class CertificatesController {
  constructor(private certificatesService: CertificatesService) {}

  @Post('claim/:courseId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Claim completion certificate (requires 100% progress)' })
  claim(@CurrentUser() user: any, @Param('courseId') courseId: string) {
    return this.certificatesService.claim(user.id, courseId);
  }

  @Get('my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('STUDENT')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List my certificates' })
  listMine(@CurrentUser() user: any) {
    return this.certificatesService.listMyCertificates(user.id);
  }

  @Get('verify/:code')
  @ApiOperation({ summary: 'Verify a certificate by code (public)' })
  verify(@Param('code') code: string) {
    return this.certificatesService.verifyByCode(code);
  }
}
