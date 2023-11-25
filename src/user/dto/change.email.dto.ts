import { IsEmail, IsString, Length, Matches, MinLength } from 'class-validator';
import { PASSWORD_REGEX } from '../../common/consts/regex.const';

export class ChangeEmailDto {
  @IsString()
  @IsEmail()
  @Length(5, 255)
  email!: string;

  @IsString()
  @MinLength(8)
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must have at least one uppercase letter and a number or special character',
  })
  password!: string;
}
