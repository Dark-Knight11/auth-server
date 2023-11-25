import { ConflictException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

/**
 * Checks the uniqueness of an email in the database.
 *
 * @param email - The email to check for uniqueness.
 * @param prisma - The PrismaService instance.
 * @throws ConflictException - If the email is already in use.
 * @returns A Promise that resolves to void.
 */
export const checkEmailUniqueness = async (
  email: string,
  prisma: PrismaService,
): Promise<void> => {
  const count = await prisma.user.count({ where: { email } });

  if (count > 0) {
    throw new ConflictException('Email already in use');
  }
};
