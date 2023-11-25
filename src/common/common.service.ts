import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  LoggerService,
} from '@nestjs/common';
import slugify from 'slugify';
import { v4 as uuid } from 'uuid';
import { IMessage } from './interfaces/message.interface';

@Injectable()
/**
 * CommonService class provides common utility functions and error handling methods.
 */
export class CommonService {
  private readonly loggerService: LoggerService;
  constructor() {
    this.loggerService = new Logger(CommonService.name);
  }

  /**
   * Throw Duplicate Error
   * Checks is an error is of the code 23505, PostgreSQL's duplicate value error,
   * and throws a conflict exception
   *
   * @param promise - The promise to be executed.
   * @param message - Optional. The error message to be thrown if a duplicate error occurs.
   * @returns A promise that resolves if the provided promise resolves, otherwise throws an error.
   */
  public async throwDuplicateError<T>(promise: Promise<T>, message?: string) {
    try {
      return await promise;
    } catch (error) {
      this.loggerService.error(error);

      if (error.code === '23505') {
        throw new ConflictException(message ?? 'Duplicated value in database');
      }

      throw new BadRequestException(error.message);
    }
  }

  /**
   * Handles the error handling and logging for a given promise.
   *
   * @param promise - The promise to handle.
   * @throws InternalServerErrorException if the input promise rejects.
   * @returns A promise that resolves with the result of the input promise.
   */
  public async throwInternalError<T>(promise: Promise<T>): Promise<T> {
    try {
      return await promise;
    } catch (error) {
      this.loggerService.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  /**
   * Formats the given title by removing leading/trailing spaces, multiple spaces, and capitalizing each word.
   *
   * @param title - The title to be formatted.
   * @returns The formatted title.
   */
  public formatName(title: string): string {
    return title
      .trim()
      .replace(/\n/g, ' ')
      .replace(/\s\s+/g, ' ')
      .replace(/\w\S*/g, (w) => w.replace(/^\w/, (l) => l.toUpperCase()));
  }

  /**
   * Generate Point Slug
   * Takes a string and generates a slug with dtos as word separators
   *
   * @param str - The string to generate the slug from.
   * @returns The generated slug.
   */
  public generatePointSlug(str: string): string {
    return slugify(str, { lower: true, replacement: '.', remove: /['_\.\-]/g });
  }

  /**
   * Generates a message object with a unique ID and the provided message.
   *
   * @param message - The message to be included in the generated object.
   * @returns The generated message object.
   */
  public generateMessage(message: string): IMessage {
    return { id: uuid(), message };
  }
}
