import { IsJWT, IsString } from 'class-validator';
import { PasswordDto } from './passwords.dto';

export class ResetPasswordDto extends PasswordDto {
  @IsString()
  @IsJWT()
  resetToken!: string;
}
