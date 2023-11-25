import { RedisOptions } from 'ioredis';

/**
 * Parses the Redis URL and returns the RedisOptions object.
 *
 * @param url - The Redis URL to parse.
 * @returns The RedisOptions object containing the parsed information.
 */
export const redisUrlParser = (url: string): RedisOptions => {
  if (url.includes('://:')) {
    const arr = url.split('://:')[1].split('@');
    const secondArr = arr[1].split(':');

    return {
      password: arr[0],
      host: secondArr[0],
      port: parseInt(secondArr[1], 10),
    };
  }
  const connectionString = url.split('://')[1];
  const arr = connectionString.split(':');
  return {
    host: arr[0],
    port: parseInt(arr[1], 10),
  };
};
