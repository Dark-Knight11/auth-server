import { IUser } from 'src/jwt/interface/user.interface';

export interface IBlacklistedToken {
  tokenId: string;
  user: IUser;
  createdAt: Date;
}
