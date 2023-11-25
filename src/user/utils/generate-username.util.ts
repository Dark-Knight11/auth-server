import { CommonService } from 'src/common/common.service';
import { PrismaService } from 'src/prisma/prisma.service';

/**
 * Generates a unique username based on the given name.
 *
 * @param name - The name to generate the username from.
 * @param commonService - The common service instance.
 * @param prisma - The Prisma service instance.
 * @returns A promise that resolves to the generated username.
 */
export const generateUsername = async (
  name: string,
  commonService: CommonService,
  prisma: PrismaService,
): Promise<string> => {
  const pointSlug = commonService.generatePointSlug(name);
  const count = await prisma.user.count({
    where: {
      username: {
        contains: pointSlug,
      },
    },
  });

  if (count > 0) {
    return `${pointSlug}${count}`;
  }

  return pointSlug;
};
