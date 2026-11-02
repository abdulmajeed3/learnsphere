import { Controller, Get, Post, Delete, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { BookmarksService } from './bookmarks.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('bookmarks')
@Controller('bookmarks')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STUDENT')
@ApiBearerAuth()
export class BookmarksController {
  constructor(private bookmarksService: BookmarksService) {}

  @Post(':courseId')
  @ApiOperation({ summary: 'Bookmark a course' })
  add(@CurrentUser() user: any, @Param('courseId') courseId: string) {
    return this.bookmarksService.addBookmark(user.id, courseId);
  }

  @Delete(':courseId')
  @ApiOperation({ summary: 'Remove a bookmark' })
  remove(@CurrentUser() user: any, @Param('courseId') courseId: string) {
    return this.bookmarksService.removeBookmark(user.id, courseId);
  }

  @Get()
  @ApiOperation({ summary: 'List bookmarked courses' })
  list(@CurrentUser() user: any) {
    return this.bookmarksService.listBookmarks(user.id);
  }

  @Get('check/:courseId')
  @ApiOperation({ summary: 'Check if a course is bookmarked' })
  check(@CurrentUser() user: any, @Param('courseId') courseId: string) {
    return this.bookmarksService.checkBookmark(user.id, courseId);
  }
}
