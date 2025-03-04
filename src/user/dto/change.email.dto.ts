import { IsEmail, IsString, IsUUID, Length, Matches, MinLength } from 'class-validator';
import { PasswordDto } from './password.dto';
import { ApiProperty } from '@nestjs/swagger';

export class ChangeEmailDto extends PasswordDto {
  @ApiProperty({
    description: 'The email of the user',
    example: 'someone@gmail.com',
    minLength: 5,
    maxLength: 255,
    type: String,
  })
  @IsString()
  @IsEmail()
  @Length(5, 255)
  email: string;
}
