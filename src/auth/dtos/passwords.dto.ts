import { IsString, Length, Matches, MinLength } from 'class-validator';
import { PASSWORD_REGEX } from 'src/common/consts/regex.const';

export class PasswordDto {
  @IsString()
  @Length(8, 35)
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must have at least one uppercase letter and a number or special character',
  })
  password1!: string;

  @IsString()
  @MinLength(8)
  password2!: string;
}
