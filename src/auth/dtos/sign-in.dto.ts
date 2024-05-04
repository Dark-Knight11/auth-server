import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';
import { PASSWORD_REGEX } from 'src/common/consts/regex.const';

export class SignInDto {
  @IsString()
  @Length(3, 255)
  @ApiProperty()
  emailorUsername: string;

  @IsString()
  @Length(8, 35)
  @ApiProperty()
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must have at least one uppercase letter and a number or special character',
  })
  password: string;
}
