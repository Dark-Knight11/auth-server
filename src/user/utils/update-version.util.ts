import dayjs from 'dayjs';

/**
 * Updates the version and updatedAt properties of a user's credentials object.
 *
 * @param user - The user object.
 * @returns The updated credentials object.
 */
export const updateVersion = (user: any) => {
  const json = user.credentials;
  json['version']++;
  json['updatedAt'] = dayjs().unix();
  return json;
};
