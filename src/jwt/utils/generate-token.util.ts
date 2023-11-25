import { IAccessPayload, IRefreshPayload, IEmailPayload } from '../interface';
import * as jwt from 'jsonwebtoken';

/**
 * Generates a JWT token based on the provided payload, secret, and options.
 *
 * @param payload - The payload to be included in the token.
 * @param secret - The secret used to sign the token.
 * @param options - The options for signing the token.
 * @returns A promise that resolves to the generated JWT token.
 */
export const generateToken = async (
  payload: IAccessPayload | IEmailPayload | IRefreshPayload,
  secret: string,
  options: jwt.SignOptions,
): Promise<string> => {
  return new Promise((resolve, rejects) => {
    jwt.sign(payload, secret, options, (error: any, token: string) => {
      if (error) {
        rejects(error);
        return;
      }
      resolve(token);
    });
  });
};
