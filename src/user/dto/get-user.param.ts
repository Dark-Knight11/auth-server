import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length } from 'class-validator';

export class GetUserParam {
  @ApiProperty({
    description: 'The id or username of the user',
    type: String,
    example: "1 or 'username'",
  })
  @IsString()
  @Length(1, 106)
  idOrUsername: string;
}
