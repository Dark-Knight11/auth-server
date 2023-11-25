import { BadRequestException } from '@nestjs/common';

/**
 * Compares two passwords and throws an error if they do not match.
 *
 * @param password1 - The first password to compare.
 * @param password2 - The second password to compare.
 * @throws BadRequestException - If the passwords do not match.
 */
export const comparePasswords = (
  password1: string,
  password2: string,
): void => {
  if (password1 !== password2) {
    throw new BadRequestException('Passwords do not match');
  }
};
