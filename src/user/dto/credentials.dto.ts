import { IsString, Matches, MinLength } from 'class-validator';
import { PASSWORD_REGEX } from 'src/common/consts/regex.const';

export class CredentialsDto {
  @IsString()
  password: string;

  @IsString()
  @MinLength(8)
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must have at least one uppercase letter and a number or special character',
  })
  newPassword: string;
}
