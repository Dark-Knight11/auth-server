import dayjs from 'dayjs';

/**
 * Updates the lastPassword, passwordUpdatedAt, version and updatedAt properties of a user's credentials object.
 *
 * @param password - The old password.
 * @param user - The user object.
 * @returns The updated user credentials object.
 */
export const updatePassword = (password: string, user: any) => {
  const json = user.credentials;
  const now = dayjs().unix();
  json['version']++;
  json['lastPassword'] = password;
  json['passwordUpdatedAt'] = now;
  json['updatedAt'] = now;
  return json;
};
