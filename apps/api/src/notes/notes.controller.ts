import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('notes')
@Controller('notes')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('STUDENT')
@ApiBearerAuth()
export class NotesController {
  constructor(private notesService: NotesService) {}

  @Get('lesson/:lessonId')
  @ApiOperation({ summary: 'List notes for a lesson' })
  list(@CurrentUser() user: any, @Param('lessonId') lessonId: string) {
    return this.notesService.listForLesson(user.id, lessonId);
  }

  @Post('lesson/:lessonId')
  @ApiOperation({ summary: 'Create a note for a lesson' })
  create(
    @CurrentUser() user: any,
    @Param('lessonId') lessonId: string,
    @Body() dto: CreateNoteDto,
  ) {
    return this.notesService.create(user.id, lessonId, dto);
  }

  @Patch(':noteId')
  @ApiOperation({ summary: 'Update a note' })
  update(@CurrentUser() user: any, @Param('noteId') noteId: string, @Body() dto: UpdateNoteDto) {
    return this.notesService.update(user.id, noteId, dto);
  }

  @Delete(':noteId')
  @ApiOperation({ summary: 'Delete a note' })
  delete(@CurrentUser() user: any, @Param('noteId') noteId: string) {
    return this.notesService.delete(user.id, noteId);
  }
}
