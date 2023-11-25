import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  checkEmailUniqueness,
  checkUsernameUniqueness,
  generateUsername,
  updatePassword,
  updateVersion,
} from './utils';
import { UserUpdateDto, ChangeEmailDto, CredentialsDto } from './dto';
import { CommonService } from 'src/common/common.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from '@prisma/client';
import * as argon from 'argon2';
import dayjs from 'dayjs';

/**
 * Service responsible for handling user-related operations.
 */
@Injectable()
export class UserService {
  constructor(
    private readonly commonService: CommonService,
    private readonly prisma: PrismaService,
  ) {}

  /**
   * Creates a new user with the provided email, name, and password.
   *
   * @param email - The email of the user.
   * @param name - The name of the user.
   * @param password - The password of the user.
   * @returns The created user.
   * @throws BadRequestException if there is an error creating the user.
   */
  async create(email: string, name: string, password: string) {
    const formattedEmail = email.toLocaleLowerCase().trim();
    await checkEmailUniqueness(formattedEmail, this.prisma);
    const formattedName = this.commonService.formatName(name);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: formattedEmail,
          name: formattedName,
          password: await argon.hash(password),
          username: await generateUsername(
            formattedName,
            this.commonService,
            this.prisma,
          ),
          credentials: {
            version: 0,
            lastPassword: '',
            passwordUpdatedAt: dayjs().unix(),
            updatedAt: dayjs().unix(),
          },
        },
      });
      return user;
    } catch (error) {
      throw new BadRequestException('Error creating user');
    }
  }

  /**
   * Retrieves a user by their ID.
   *
   * @param id - The ID of the user.
   * @returns A Promise that resolves to the user object if found, or throws an exception if not found.
   * @throws {NotFoundException} If the user is not found.
   * @throws {BadRequestException} If an error occurs while retrieving the user.
   */
  async findOneById(id: string) {
    try {
      const user = await this.prisma.user.findUnique({ where: { id } });
      return user;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      throw new BadRequestException();
    }
  }

  /**
   * Finds a user by email.
   *
   * @param email - The email of the user.
   * @returns The user object if found, otherwise throws an error.
   * @throws NotFoundException - If the user is not found.
   * @throws BadRequestException - If an error occurs while querying the database.
   */
  async findOneByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: email.toLocaleLowerCase().trim() },
      });
      return user;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      throw new BadRequestException();
    }
  }

  /**
   * Finds a user by their credentials.
   *
   * @param id - The ID of the user.
   * @param version - The version of the credentials.
   * @returns The user object if found, otherwise null.
   * @throws NotFoundException - If the user is not found.
   * @throws BadRequestException - If an error occurs while querying the database.
   */
  async findOnebyCredentials(id: string, version: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id: id,
          credentials: {
            path: ['version'],
            equals: version,
          },
        },
      });
      return user;
    } catch (error) {
      if (error.code === 'P2025') {
        throw new NotFoundException('User not found');
      }
      throw new BadRequestException();
    }
  }

  /**
   * Finds a user by their username.
   *
   * @param username - The username of the user to find.
   * @param forAuth - Optional parameter indicating if the user is being searched for authentication purposes.
   * @returns The found user.
   * @throws UnauthorizedException if the user is being searched for authentication purposes and the credentials are invalid.
   * @throws NotFoundException if the user is not found.
   * @throws BadRequestException for any other error.
   */
  async findOneByUsername(username: string, forAuth = false) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { username: username.toLocaleLowerCase() },
      });
      return user;
    } catch (error) {
      if (error.code === 'P2025') {
        if (forAuth) {
          throw new UnauthorizedException('Invalid credentials');
        } else {
          throw new NotFoundException('User not found');
        }
      }
      throw new BadRequestException();
    }
  }

  /**
   * Retrieves a user by email without performing any checks.
   *
   * @param email - The email of the user.
   * @returns A Promise that resolves to the user object.
   * @throws UnauthorizedException if the user is not found.
   */
  async uncheckedUserByEmail(email: string): Promise<User> {
    try {
      return this.prisma.user.findUnique({
        where: { email: email.toLocaleLowerCase().trim() },
      });
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  /**
   * Updates a user with the specified ID.
   *
   * @param userId - The ID of the user to update.
   * @param dto - The data transfer object containing the updated user information.
   * @returns The updated user.
   * @throws ConflictException if the username is already in use.
   * @throws BadRequestException if the provided name is the same as the current name or if the provided username is the same as the current username.
   */
  async update(userId: string, dto: UserUpdateDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    const { name, username } = dto;

    if (name !== undefined && name !== null) {
      if (name === user.name) {
        throw new BadRequestException('Name must be different');
      }
      user.name = this.commonService.formatName(name);
    }

    if (username != undefined && username != null) {
      const formattedUsername = dto.username.toLocaleLowerCase();

      if (user.username === formattedUsername) {
        throw new BadRequestException('Username should be different');
      }

      await checkUsernameUniqueness(formattedUsername, this.prisma);
      user.username = formattedUsername;
    }
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { name: user.name, username: user.username },
      });
    } catch (error) {
      throw new BadRequestException('Error updating user');
    }

    return user;
  }

  /**
   * Updates the email of a user.
   *
   * @param dto - The ChangeEmailDto object containing the new email and password.
   * @param userId - The ID of the user to update.
   * @returns The updated user object.
   * @throws ConflictException if the email is already in use.
   * @throws BadRequestException if the provided password is invalid.
   */
  async updateEmail(dto: ChangeEmailDto, userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    const { email, password } = dto;
    if (!(await argon.verify(user.password, password))) {
      throw new BadRequestException('Invalid password');
    }

    const formattedEmail = email.toLocaleLowerCase().trim();
    await checkEmailUniqueness(formattedEmail, this.prisma);
    user.credentials = updateVersion(user);
    user.email = formattedEmail;
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { email: user.email, credentials: user.credentials },
      });
    } catch (error) {
      throw new BadRequestException('Error updating email');
    }
    return user;
  }

  /**
   * Updates the password of a user.
   *
   * @param dto - The credentials DTO containing the current and new passwords.
   * @param userId - The ID of the user.
   * @returns The updated user object.
   * @throws BadRequestException if the current password is invalid or the new password is the same as the current password.
   */
  async updatePassword(dto: CredentialsDto, userId: string) {
    const user = await this.findOneById(userId);
    const { password, newPassword } = dto;
    if (!(await argon.verify(user.password, password))) {
      throw new BadRequestException('Invalid password');
    }

    if (!(await argon.verify(user.password, newPassword))) {
      throw new BadRequestException('New password must be different');
    }

    user.credentials = updatePassword(newPassword, user);
    user.password = await argon.hash(newPassword);
    try {
      await this.prisma.user.update({
        where: { id: userId },
        data: { password: user.password, credentials: user.credentials },
      });
    } catch (error) {
      throw new BadRequestException('Error updating password');
    }
    return user;
  }

  /**
   * Resets the password for a user.
   *
   * @param userId - The ID of the user.
   * @param password - The new password.
   * @param version - The version of the user's credentials.
   * @throws UnauthorizedException if the credentials are invalid.
   * @throws BadRequestException if there is an error resetting the password.
   * @returns The updated user object.
   */
  async resetPassword(userId: string, password: string, version: number) {
    try {
      const user = await this.findOnebyCredentials(userId, version);
      user.credentials = updatePassword(password, user);
      user.password = await argon.hash(password);
      try {
        await this.prisma.user.update({
          where: { id: userId },
          data: { password: user.password, credentials: user.credentials },
        });
        return user;
      } catch (error) {
        throw new BadRequestException('Error resetting password');
      }
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  /**
   * Removes a user by their ID.
   *
   * @param userId - The ID of the user to remove.
   * @returns A message indicating the success of the operation.
   * @throws BadRequestException if there is an error deleting the user.
   */
  async remove(userId: string) {
    try {
      const res = await this.prisma.user.delete({ where: { id: userId } });
      if (!res) {
        throw new BadRequestException('Error deleting user');
      }
      return {
        message: 'User deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException('Error deleting user');
    }
  }
}
