import * as jwt from 'jsonwebtoken';

/**
 * Verifies a JWT token and returns the payload.
 *
 * @template T - The type of the payload.
 * @param token - The JWT token to verify.
 * @param secret - The secret key used to sign the token.
 * @param options - Additional options for token verification.
 * @returns A promise that resolves to the payload of the verified token.
 */
export const verifyToken = async <T>(
  token: string,
  secret: string,
  options: jwt.VerifyOptions,
): Promise<T> => {
  return new Promise((resolve, rejects) => {
    jwt.verify(token, secret, options, (error: any, payload: T) => {
      if (error) {
        rejects(error);
        return;
      }
      resolve(payload);
    });
  });
};
