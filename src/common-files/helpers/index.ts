import * as bcrypt from 'bcrypt';
import { ImageFormat, IUserRequest } from '../../interfaces';

export const generateHash = async (password: string): Promise<string> => {
  const saltRounds = process.env.BCRYPT_SALT_ROUNDS
    ? parseInt(process.env.BCRYPT_SALT_ROUNDS, 10)
    : 10;
  const salt = await bcrypt.genSalt(saltRounds);
  const hash = await bcrypt.hash(password, salt);

  return hash;
};

export const compareHash = async (
  password: string,
  savedPassword: string,
): Promise<boolean> => {
  return bcrypt.compare(password, savedPassword);
};

export function parseFormat(mimetype: string): ImageFormat | null {
  switch (mimetype) {
    // eslint-disable-next-line
    case ImageFormat.PNG:
      return ImageFormat.PNG;
    // eslint-disable-next-line
    case ImageFormat.JPG:
      return ImageFormat.JPG;
    default:
      return null;
  }
}

export function getExtension(format: string): string {
  switch (format as ImageFormat) {
    case ImageFormat.PNG:
      return 'png';
    case ImageFormat.JPG:
      return 'jpg';
    default:
      return '';
  }
}

export const getUserId = (user: IUserRequest | undefined): string => {
  return user ? user.sub : '';
};
