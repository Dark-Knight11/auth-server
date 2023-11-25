import { BadRequestException } from '@nestjs/common';
import { User } from '@prisma/client';
import { isEmail } from 'class-validator';
import { SLUG_REGEX } from 'src/common/consts/regex.const';
import { UserService } from 'src/user/user.service';

/**
 * Finds a user by their email or username.
 *
 * @param emailOrUsername - The email or username of the user.
 * @param userService - The user service used to perform the search.
 * @throws BadRequestException if the email or username is invalid.
 * @returns A promise that resolves to the found user.
 */
export const findOneByUsernameorEmail = async (
  emailOrUsername: string,
  userService: UserService,
): Promise<User> => {
  if (emailOrUsername.includes('@')) {
    if (isEmail(emailOrUsername)) {
      throw new BadRequestException('Invalid email');
    }
    return userService.findOneByEmail(emailOrUsername);
  }

  if (
    emailOrUsername.length < 3 ||
    emailOrUsername.length > 106 ||
    !SLUG_REGEX.test(emailOrUsername)
  ) {
    throw new BadRequestException('Invalid username');
  }
  return userService.findOneByUsername(emailOrUsername);
};
