import { ApiProperty } from "@nestjs/swagger";
import { IsString, Matches, MinLength } from "class-validator";
import { PASSWORD_REGEX } from "src/common/consts/regex.const";

export class PasswordDto {
  @ApiProperty({
    description: 'The password of the user',
    minLength: 1,
    type: String,
  })
  @IsString()
  @MinLength(8)
  @Matches(PASSWORD_REGEX, {
    message:
      'Password must have at least one uppercase letter and a number or special character',
  })
  password!: string;
}