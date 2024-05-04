import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express-serve-static-core';

export const refreshTokenFromReq = (req: Request, cookieName: string): string => {
  const token: string | undefined = req.signedCookies[cookieName];

  if (!token) {
    throw new UnauthorizedException();
  }
  return token;
};
