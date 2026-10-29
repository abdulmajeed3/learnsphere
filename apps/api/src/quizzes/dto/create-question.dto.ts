import { IsString, IsArray, ValidateNested, IsBoolean, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class OptionDto {
  @ApiProperty() @IsString() text: string;
  @ApiProperty() @IsBoolean() isCorrect: boolean;
}

export class CreateQuestionDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  text: string;

  @ApiProperty({ type: [OptionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OptionDto)
  options: OptionDto[];
}
