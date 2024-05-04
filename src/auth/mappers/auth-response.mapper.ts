import { IAuthResponse, IAuthResult } from '../interfaces';
import { AuthResponseUserMapper } from './auth-response-user.mapper';

export class AuthResponseMapper implements IAuthResponse {
  user: AuthResponseUserMapper;
  accessToken: string;

  constructor(values: IAuthResponse) {
    Object.assign(this, values);
  }

  static map(result: IAuthResult): AuthResponseMapper {
    return new AuthResponseMapper({
      user: AuthResponseUserMapper.map(result.user),
      accessToken: result.accessToken,
    });
  }
}
