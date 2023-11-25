import { IsString, Length, Matches } from 'class-validator';
import { PASSWORD_REGEX } from 'src/common/consts/regex.const';

export class SignInDto {
  @IsString()
  @Length(3, 255)
  emailorUsername: string;

  @IsString()
  @Length(8, 35)
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must have at least one uppercase letter and a number or special character',
  })
  password: string;
}
