import { User } from '@prisma/client';
import { IAuthResponseUser } from '../interfaces';

export class AuthResponseUserMapper implements IAuthResponseUser {
  id: string;
  name: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;

  constructor(values: IAuthResponseUser) {
    Object.assign(this, values);
  }

  static map(user: User): AuthResponseUserMapper {
    return new AuthResponseUserMapper({
      id: user.id,
      name: user.name,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    });
  }
}
