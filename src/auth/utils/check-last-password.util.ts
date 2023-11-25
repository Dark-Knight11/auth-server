import { UnauthorizedException } from '@nestjs/common';
import { Credentials } from '../interfaces';
import * as argon from 'argon2';
import dayjs from 'dayjs';

/**
 * Checks if the provided password matches the last password in the credentials object.
 *
 * @param credentials - The credentials object containing the last password and password update timestamp.
 * @param password - The password to be checked.
 * @throws UnauthorizedException - If the password is invalid or has been changed recently.
 */
export const checkLastPassword = async (
  credentials: Credentials,
  password: string,
) => {
  const { lastPassword, passwordUpdatedAt } = credentials;
  if (
    lastPassword.length === 0 ||
    !(await argon.verify(lastPassword, password))
  ) {
    throw new UnauthorizedException('Invalid credentials');
  }
  const now = dayjs();
  const time = dayjs.unix(passwordUpdatedAt);
  const months = now.diff(time, 'month');
  const message = 'You changed your password ';

  if (months > 0) {
    throw new UnauthorizedException(
      message + months + (months > 1 ? ' months ago' : ' month ago'),
    );
  }

  const days = now.diff(time, 'day');

  if (days > 0) {
    throw new UnauthorizedException(
      message + days + (days > 1 ? ' days ago' : ' day ago'),
    );
  }

  const hours = now.diff(time, 'hour');

  if (hours > 0) {
    throw new UnauthorizedException(
      message + hours + (hours > 1 ? ' hours ago' : ' hour ago'),
    );
  }

  throw new UnauthorizedException(message + 'recently');
};
