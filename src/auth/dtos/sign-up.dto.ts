import { IsEmail, IsString, Length, Matches } from 'class-validator';
import { PasswordDto } from './passwords.dto';
import { NAME_REGEX } from 'src/common/consts/regex.const';

export class SignUpDto extends PasswordDto {
  @IsString()
  @Length(3, 50, {
    message: 'Name must be between 3 and 50 characters',
  })
  @Matches(NAME_REGEX, {
    message: 'Name must not have special characters',
  })
  name!: string;

  @IsString()
  @IsEmail()
  @Length(5, 255)
  email!: string;
}
