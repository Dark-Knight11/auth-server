import * as jwt from 'jsonwebtoken';
import { IAccessToken, IRefreshToken, IEmailToken } from '../interface';
import {
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';

/**
 * Throws a BadRequestException if the promise rejects with a TokenExpiredError or JsonWebTokenError,
 * otherwise throws an InternalServerErrorException with the error object.
 *
 * @template T - The type of the token.
 * @param promise - The promise to be executed.
 * @returns A promise that resolves with the result of the input token.
 */
export const throwBadRequest = async <
  T extends IAccessToken | IRefreshToken | IEmailToken,
>(
  promise: Promise<T>,
): Promise<T> => {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new BadRequestException('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new BadRequestException('Invalid token');
    }
    throw new InternalServerErrorException(error);
  }
};
