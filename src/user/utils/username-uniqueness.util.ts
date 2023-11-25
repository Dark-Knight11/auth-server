import { ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

/**
 * Checks the uniqueness of a username in the database.
 *
 * @param username - The username to check for uniqueness.
 * @param prisma - The PrismaService instance.
 * @throws ConflictException - If the username is already in use.
 * @returns A Promise that resolves to void.
 */
export const checkUsernameUniqueness = async (
  username: string,
  prisma: PrismaService,
): Promise<void> => {
  const count = await prisma.user.count({ where: { username } });

  if (count > 0) {
    throw new ConflictException('Username already in use');
  }
};
