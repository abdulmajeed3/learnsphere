import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EnrollDto {
  @ApiProperty()
  @IsUUID()
  courseId: string;
}
