import { IsEmail, IsString, Length } from 'class-validator';

export class EmailDto {
  @IsString()
  @IsEmail()
  @Length(5, 255)
  email!: string;
}
