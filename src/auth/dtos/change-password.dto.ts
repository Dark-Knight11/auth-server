import { IsString, MinLength } from 'class-validator';
import { PasswordDto } from './passwords.dto';

export class ChangePasswordDto extends PasswordDto {
  @IsString()
  @MinLength(8)
  oldPassword!: string;
}
