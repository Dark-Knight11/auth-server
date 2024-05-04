import { Response } from 'express';

export const saveRefreshCookie = (
  res: Response,
  token: string,
  cookieName: string,
  cookiePath: string,
  refreshTime: number,
) => {
  return res.cookie(cookieName, token, {
    secure: true,
    httpOnly: true,
    signed: true,
    path: cookiePath,
    expires: new Date(Date.now() + refreshTime * 1000),
  });
};
