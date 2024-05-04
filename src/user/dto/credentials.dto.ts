import { IsString, Matches, MinLength } from 'class-validator';
import { PASSWORD_REGEX } from 'src/common/consts/regex.const';
import { PasswordDto } from './password.dto';

export class CredentialsDto extends PasswordDto {
  @IsString()
  @MinLength(8)
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must have at least one uppercase letter and a number or special character',
  })
  newPassword: string;
}
