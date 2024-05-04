import { User } from '@prisma/client';
import { IResponseUser } from '../interfaces/response-user.interface';
import { ApiProperty } from '@nestjs/swagger';

export class ResponseUserMapper implements IResponseUser {
  @ApiProperty({
    description: 'User id',
    example: '313ec2d4-35e1-4392-97b6-96a891e595b6',
    type: String,
  })
  id: string;

  @ApiProperty({
    description: 'User name',
    example: 'John Doe',
    minLength: 3,
    maxLength: 100,
    type: String,
  })
  name: string;

  @ApiProperty({
    description: 'User username',
    example: 'john.doe1',
    minLength: 3,
    maxLength: 106,
    type: String,
  })
  username: string;

  @ApiProperty({
    description: 'User creation date',
    example: '2021-01-01T00:00:00.000Z',
    type: String,
  })
  createdAt: string;

  @ApiProperty({
    description: 'User last update date',
    example: '2021-01-01T00:00:00.000Z',
    type: String,
  })
  updatedAt: string;

  constructor(values: IResponseUser) {
    Object.assign(this, values);
  }

  static map(user: User): ResponseUserMapper {
    return new ResponseUserMapper({
      id: user.id,
      name: user.name,
      username: user.username,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    });
  }
}
